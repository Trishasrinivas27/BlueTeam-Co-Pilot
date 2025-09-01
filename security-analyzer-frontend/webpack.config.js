const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    proxy: {
      '/api/webhook-test': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        pathRewrite: {
          '^/api/webhook-test': '/webhook-test'
        },
        onProxyReq: (proxyReq, req, res) => {
          console.log('🔄 Proxying request:', req.method, req.url);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log('📡 n8n response:', proxyRes.statusCode);
        },
        onError: (err, req, res) => {
          console.error('❌ Proxy error:', err.message);
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
