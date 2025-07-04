/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createRequire } from 'module';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import camelCase from 'camelcase';
import capitalize from 'capitalize';
import createEntryFile from './createEntryFile.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const entries = {};
const plugins = [];
const extension = require('./extension.json');

export default (env, argv) => {
  // Each view becomes its own "app". These are automatically generated based on naming convention.
  ['action'].forEach((type) => {
    const typePluralized = type + 's';
    const delegates =
      type === 'configuration'
        ? [extension['configuration']]
        : extension[typePluralized];

    delegates.forEach((itemDescriptor) => {
      let itemNameCapitalized;
      let chunkName;

      if (itemDescriptor.viewPath) {
        if (type === 'configuration') {
          itemNameCapitalized = 'Configuration';
          chunkName = 'configuration/configuration';
        } else {
          const itemName = itemDescriptor.name;
          const itemNameCamelized = camelCase(itemName);
          itemNameCapitalized = capitalize(itemNameCamelized);
          chunkName = `${typePluralized}/${itemNameCamelized}`;
        }

        const entryPath = `./.entries/${chunkName}.js`;
        createEntryFile(entryPath, itemNameCapitalized, chunkName);
        entries[chunkName] = entryPath;

        plugins.push(
          new HtmlWebpackPlugin({
            title: itemDescriptor.displayName || 'Configuration',
            reactDevHook:
              argv.mode === 'development'
                ? '<script> if (window.parent !== window) {' +
                  ' window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = ' +
                  'window.parent.__REACT_DEVTOOLS_GLOBAL_HOOK__; ' +
                  '} </script>'
                : '',
            filename: `${chunkName}.html`,
            template: 'src/view/template.html',
            chunks: ['common', chunkName]
          })
        );
      }
    });
  });

  let minChunks = Math.round(Object.keys(entries).length / 4);
  if (minChunks < 2) {
    minChunks = 2;
  }

  return {
    optimization: {
      runtimeChunk: false,
      splitChunks: {
        cacheGroups: {
          default: false,
          commons: {
            name: 'common',
            chunks: 'all',
            minChunks: minChunks
          }
        }
      }
    },
    entry: entries,
    devtool: argv.mode === 'development' ? 'source-map' : false,
    plugins: [
      ...plugins,
      new (require('webpack').DefinePlugin)({
        'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
        'process.browser': JSON.stringify(true),
        'process.version': JSON.stringify(''),
        'process.versions': JSON.stringify({}),
        'process.env': JSON.stringify(process.env || {}),
        global: 'globalThis'
      })
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: /src\/view/,
          exclude: /__tests__/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/react', '@babel/env'],
                plugins: ['@babel/plugin-proposal-class-properties']
              }
            }
          ]
        },
        {
          test: /\.js$/,
          include: /\.entries/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/env']
              }
            }
          ]
        },
        {
          test: /\.styl/,
          include: /src\/view/,
          use: ['style-loader', 'css-loader', 'stylus-loader']
        },
        {
          test: /\.css/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          use: 'file-loader'
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: 'url-loader?limit=10000&mimetype=application/font-woff'
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: 'file-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      fallback: {
        process: false,
        util: false,
        path: false,
        fs: false
      }
    }
  };
};
