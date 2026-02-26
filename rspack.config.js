const path = require('path');
const HtmlRspackPlugin = require('html-rspack-plugin');
const { DefinePlugin, ProvidePlugin } = require('@rspack/core');
const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - True if port is available
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false); // Port is in use
    });
    server.once('listening', () => {
      server.close();
      resolve(true); // Port is available
    });
    server.listen(port);
  });
}

/**
 * Find an available port starting from a given port
 * @param {number} startPort - The port to start checking from
 * @param {number} basePort} - The base port to increment from (for tracking)
 * @returns {Promise<number>} - An available port number
 */
async function findAvailablePort(startPort, basePort = 4200) {
  let port = startPort;
  const maxPort = startPort + 100; // Try up to 100 ports

  while (port < maxPort) {
    const available = await checkPort(port);
    if (available) {
      return port;
    }
    port++;
  }

  // If no port found in range, use a random high port as fallback
  const fallbackPort = basePort + 1000 + Math.floor(Math.random() * 1000);
  console.warn(`Warning: Could not find port in range ${startPort}-${maxPort}, using fallback port ${fallbackPort}`);
  return fallbackPort;
}

/**
 * Get port from environment variable or find an available one
 * This allows CI/CD pipelines to specify PORT environment variable
 * @param {number} defaultPort - The default port to start from
 * @returns {Promise<number>} - The port to use
 */
async function getPort(defaultPort = 4200) {
  // Check if PORT is specified via environment variable (useful for CI/CD)
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (isNaN(port)) {
      throw new Error(`Invalid PORT environment variable: ${envPort}`);
    }
    // If the specified port is in use, increment from it
    const available = await checkPort(port);
    if (!available) {
      console.warn(`Port ${port} is in use, finding alternative...`);
      return findAvailablePort(port + 1, port);
    }
    return port;
  }

  // Find an available port starting from default
  return findAvailablePort(defaultPort, defaultPort);
}

/**
 * Rspack configuration for Angular with Bun runtime
 *
 * This configuration uses esbuild to compile TypeScript and relies on
 * Angular's JIT compiler in the browser.
 */
module.exports = async () => {
  const port = await getPort(4200);
  console.log(`Using port ${port}`);

  return {
    entry: {
      main: './src/main.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist/angular-rspack-demo'),
      filename: '[name].[contenthash].js',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js', '.mjs', '.json'],
      mainFields: ['module', 'main'],
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          loader: 'raw-loader',
        },
        {
          test: /\.[cm]?ts$/,
          exclude: /[\/\\](?:core-js|zone\.js|node_modules)[\/\\]/,
          use: {
            loader: 'esbuild-loader',
            options: {
              target: 'es2022',
              tsconfigRaw: {
                compilerOptions: {
                  target: 'es2022',
                  module: 'es2022',
                  moduleResolution: 'bundler',
                  experimentalDecorators: true,
                  useDefineForClassFields: false,
                  esModuleInterop: true,
                  skipLibCheck: true,
                },
              },
            },
          },
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/,
          type: 'asset',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset',
        },
      ],
    },
    plugins: [
      new HtmlRspackPlugin({
        template: './src/index.html',
        scriptLoading: 'defer',
      }),
      // Provide global for Angular compatibility
      new ProvidePlugin({
        global: ['window', 'globalThis'],
      }),
      // Define Angular production mode flag
      new DefinePlugin({
        'ngDevMode': 'false',
      }),
    ],
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    devServer: {
      port,
      historyApiFallback: true,
      hot: true,
      static: {
        directory: path.resolve(__dirname, 'src'),
        publicPath: '/',
      },
      devMiddleware: {
        publicPath: '/',
      },
    },
    // Externals for scripts loaded via angular.json (like winbox)
    externals: {
      'winbox': 'WinBox',
    },
  };
};
