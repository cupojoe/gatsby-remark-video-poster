"use strict";

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

var select = require("unist-util-select");

var path = require("path");

var isRelativeUrl = require("is-relative-url");

var _ = require("lodash");

var _require = require("gatsby-plugin-sharp"),
    queueImageResizing = _require.queueImageResizing;

var _Promise = require("bluebird");

var cheerio = require("cheerio");

var slash = require("slash"); // If the poster is relative (not hosted elsewhere)
// 1. Find the image file
// 2. Create an optimized image
// TODO: Return a replacement for the video tag with inline css for the aspect ratio of the video based on the poster aspect ratio


module.exports = function (_ref, pluginOptions) {
  var files = _ref.files,
      markdownNode = _ref.markdownNode,
      markdownAST = _ref.markdownAST,
      pathPrefix = _ref.pathPrefix,
      getNode = _ref.getNode,
      reporter = _ref.reporter;
  var defaults = {
    width: 1920,
    pathPrefix: pathPrefix
  };

  var options = _.defaults(pluginOptions, defaults); // Takes a node and generates the optimized image and then returns the path to it


  var generateImage =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(node, resolve) {
      var parentNode, imagePath, imageNode, processedImage;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // Check if this markdownNode has a File parent. This plugin
              // won't work if the image isn't hosted locally.
              parentNode = getNode(markdownNode.parent);

              if (!(parentNode && parentNode.dir)) {
                _context.next = 5;
                break;
              }

              imagePath = slash(path.join(parentNode.dir, node.url));
              _context.next = 6;
              break;

            case 5:
              return _context.abrupt("return", null);

            case 6:
              imageNode = _.find(files, function (file) {
                if (file && file.absolutePath) {
                  return file.absolutePath === imagePath;
                }

                return null;
              });

              if (!(!imageNode || !imageNode.absolutePath)) {
                _context.next = 9;
                break;
              }

              return _context.abrupt("return", resolve());

            case 9:
              _context.next = 11;
              return queueImageResizing({
                file: imageNode,
                args: options,
                reporter: reporter
              });

            case 11:
              processedImage = _context.sent;

              if (processedImage) {
                _context.next = 14;
                break;
              }

              return _context.abrupt("return", resolve());

            case 14:
              return _context.abrupt("return", processedImage.src);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function generateImage(_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  var rawHtmlNodes = select(markdownAST, "html");

  _Promise.all(rawHtmlNodes.map(function (node) {
    return new _Promise(
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(resolve, reject) {
        var $, posterNode, posterAttr, generatedUrl;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                $ = cheerio.load(node.value);
                posterNode = $('[poster]');
                posterAttr = posterNode.attr('poster');

                if (!(typeof posterAttr !== 'undefined')) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 6;
                return generateImage({
                  url: posterAttr
                }, resolve);

              case 6:
                generatedUrl = _context2.sent;

                if (generatedUrl) {
                  node.value = node.value.replace(new RegExp(posterAttr, "g"), generatedUrl);
                  resolve(node);
                } else {
                  resolve();
                }

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x3, _x4) {
        return _ref3.apply(this, arguments);
      };
    }());
  }));
};