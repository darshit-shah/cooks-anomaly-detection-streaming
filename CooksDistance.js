// JScript source code
"use strict";
var CooksDistance = {
    MSE: function (xValues, yValues) {
        var result = {};
        if (!Array.isArray(xValues)) {
            result = { status: false, content: { message: 'x is not an array'} };
        }
        else if (!Array.isArray(yValues)) {
            result = { status: false, content: { message: 'y is not an array'} };
        }
        else if (xValues.length != yValues.length) {
            result = { status: false, content: { message: 'length of x and y values does not match'} };
        }
        else {
            var numeric = require('./numeric-1.2.6.js');
            var storage = {};
            storage.count = xValues.length;
            storage.X = new Array(xValues.length);
            storage.Y = new Array(yValues.length);
            for (var i = 0; i < xValues.length; i++) {
                storage.X[i] = [1, xValues[i]];
                storage.Y[i] = [yValues[i]];
            }
            storage.Xt = CooksDistance.Transpose(storage.X);
            storage.XtX = numeric.dot(storage.Xt, storage.X);
            storage.XtY = numeric.dot(storage.Xt, storage.Y);
            storage.Yt = CooksDistance.Transpose(storage.Y);
            storage.YtY = numeric.dot(storage.Yt, storage.Y);
            storage.Inv_XtX = numeric.inv(storage.XtX);
            storage.Beta = numeric.dot(storage.Inv_XtX, storage.XtY);
            storage.XBeta = numeric.dot(storage.X, storage.Beta);
            storage.YminusXBeta = numeric.sub(storage.Y, storage.XBeta);
            storage.YminusXBetat = CooksDistance.Transpose(storage.YminusXBeta);
            storage.MSE = numeric.dot([1 / storage.X.length], numeric.dot(storage.YminusXBetat, storage.YminusXBeta));

            delete storage.X;
            delete storage.Y;
            delete storage.Xt;
            delete storage.Yt;
            delete storage.Inv_XtX;
            delete storage.Beta;
            delete storage.Inv_XtX;
            delete storage.XBeta;
            delete storage.YminusXBeta;
            delete storage.YminusXBetat;
            result = { status: true, content: storage };
        }
        return result;
    },
    Transpose: function (x) {
        var xt = NaN;
        if (!Array.isArray(x)) {
            xt = x;
        }
        else if (!Array.isArray(x[0])) {
            xt = new Array(x.length);
            for (var i = 0; i < x.length; i++) {
                xt[i] = [x[i]];
            }
        }
        else if (x[0].length == 1) {
            xt = new Array(x.length);
            for (var i = 0; i < x.length; i++) {
                xt[i] = x[i][0];
            }
        }
        else {
            var xt = new Array(x[0].length);
            for (var i = 0; i < x[0].length; i++) {
                xt[i] = new Array(x.length);
            }
            for (var row = 0; row < x.length; row++) {
                if (x[row].length != x[0].length) {
                    xt = NaN;
                    break;
                }
                for (var col = 0; col < x[row].length; col++) {
                    xt[col][row] = x[row][col];
                }
            }
        }
        return xt;
    },
    StreamingMSE: function (xValues, yValues, o) {
        var n = CooksDistance.MSE(xValues, yValues);
        if (n.status == false) {
            return n;
        }
        else {
            var storage = {};
            var os = o.content;
            var ns = n.content;
            storage.count = os.count + ns.count;
            storage.XtX = numeric.add(os.XtX, ns.XtX);
            storage.XtY = numeric.add(os.XtY, ns.XtY);
            storage.YtY = numeric.add(os.YtY, ns.YtY);

            storage.Inv_XtXdotXtY = numeric.dot(numeric.inv(storage.XtX), storage.XtY);

            storage.A = numeric.dot([1 / storage.count], storage.YtY);
            storage.B = numeric.dot([2 / storage.count], numeric.dot(numeric.add(CooksDistance.Transpose(os.XtY), CooksDistance.Transpose(ns.XtY)), storage.Inv_XtXdotXtY));
            storage.C = numeric.dot([1 / storage.count], numeric.dot(CooksDistance.Transpose(storage.Inv_XtXdotXtY), numeric.dot(storage.XtX, storage.Inv_XtXdotXtY)));
            storage.MSE = numeric.add(numeric.sub(storage.A, storage.B), storage.C);

            delete storage.A;
            delete storage.B;
            delete storage.C;
            delete storage.Inv_XtXdotXtY;

            return { status: true, content: storage };
        }
    }
}


//var x = 10;
//console.log(x, CooksDistance.Transpose(x));
//x = [1, 2, 3];
//console.log(x, CooksDistance.Transpose(x));
//x = [[1], [2], [3]];
//console.log(x, CooksDistance.Transpose(x));
//x = [[1, 2, 3], [4, 5, 6]];
//console.log(x, CooksDistance.Transpose(x));
//x = [[1, 2, 3], [4, 5, 6, 7, 8]];
//console.log(x, CooksDistance.Transpose(x));
//x = [[1, 2, 3], [4, 5]];
//console.log(x, CooksDistance.Transpose(x));

var output1 = CooksDistance.MSE([1, 3, 9], [2, 3, 5]);
console.log(output1.content.MSE);
var output2 = CooksDistance.MSE([1, 3, 9, 6, 5], [2, 3, 5, 4, 6]);
console.log(output2.content.MSE);
var output3 = CooksDistance.StreamingMSE([6, 5], [4, 6], output1);
console.log(output3.content.MSE);