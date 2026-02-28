const path = require('path');
const HtmlRspackPlugin = require('html-rspack-plugin');

/**
 * Rspack configuration for Angular with Bun runtime
 * Uses custom Angular Linker loader for JIT fallback
 */
module.exports = {
  entry: {
    winbox: 'winbox/dist/winbox.bundle.min.js',
    main: './src/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist/angular-rspack-demo'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json'],
    fallback: {
      path: false,
      fs: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
      // Process ALL node_modules JS files with Angular linker first
      {
        test: /\.m?js$/,
        include: /[\/\\]node_modules[\/\\]/,
        resolve: {
          fullySpecified: false,
        },
        use: path.resolve(__dirname, 'angular-linker-loader.js'),
      },
      // Then process TypeScript files
      {
        test: /\.[cm]?ts$/,
        exclude: /[\/\\]node_modules[\/\\]/,
        use: [
          {
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
        ],
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
      scriptLoading: 'blocking',
      entryNames: ['winbox', 'main'],
    }),
  ],
  optimization: {
    minimize: true,
  },
  devServer: {
    port: 4201,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'src'),
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
