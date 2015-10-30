$(document).ready(function() {
  'use strict';

  let $expression = $('#expression');

  $('#calculator div:not(#display)').click(buttonPressed);

  function buttonPressed(event) {
    //console.log(event.target.id); // DEBUG

    let buttonID = event.target.id;
    let expression = $expression.text();
    let lastToken = expression[expression.length - 1];

    if (!isNaN(+buttonID)) {
      $expression.text( expression + buttonID );
    } else if (buttonID === 'decimal') {
      let tokens = expression.split(/([+\-*\/%~])/);
      if (tokens[tokens.length - 1].indexOf('.') === -1) {
        $expression.text( expression + '.' );
      }
    } else if (buttonID === 'clear') {
      $expression.empty();
    } else if (buttonID === 'sign' && (isNaN(+lastToken) || lastToken === '~')) {
      if (lastToken === '~') {
        $expression.text( expression.slice(0, expression.length - 1) );
      } else {
        $expression.text( expression + '~' );
      }
    } else {

      if (!isNaN(+lastToken) || lastToken === '%') {
        let symbol;

        switch (buttonID) {
          case 'add':
            symbol = '+';
            break;
          case 'subtract':
            symbol = '-';
            break;
          case 'multiply':
            symbol = '*';
            break;
          case 'divide':
            symbol = '/';
            break;
          case 'percent':
            symbol = (lastToken === '%') ? '' : '%';
            break;
          case 'sign':
            // this is a special case handled above
            symbol = '';
            break;
          case 'equals':
            symbol = evaluate(expression);
            expression = '';
            break;
          default:
            throw new Error('symbol not defined');
        }

        $expression.text( expression + symbol );
      }

    }
  }

  var symbolDict = { 'c': 'clear',
    '~': 'sign',
    '%': 'percent',
    '/': 'divide',
    '*': 'multiply',
    '-': 'subtract',
    '+': 'add',
    '.': 'decimal',
    '=': 'equals'
  };

  // use keyboard input
  $(window).on('keypress', function(event) {
    let keyCode = event.keyCode;
    let key = (event.keyCode === 13) ? '=' : String.fromCharCode(keyCode); 

    if (!isNaN(+key) && key !== ' ') {
      buttonPressed({
        target: {id: key}
      });
    } else if (symbolDict.hasOwnProperty(key)) {
      buttonPressed({
        target: {id: symbolDict[key]}
      });
    }
  });

  // These next two functions are used in the evaluate function below.

  Array.prototype.indexOfEither = function(a, b) {
    let aIndex = this.indexOf(a);
    let bIndex = this.indexOf(b);
    if (aIndex === -1) {
      return bIndex;
    } else if (bIndex === -1) {
      return aIndex;
    } else {
      return Math.min(aIndex, bIndex);
    }
  }

  function substitute(tokens, replacement, positionOfOperator) {
    let before = tokens.slice(0, positionOfOperator - 1);
    let after = tokens.slice(positionOfOperator + 2);
    return before.concat([replacement]).concat(after);
  }

  function evaluate(expression) {
    let tokens = expression.split(/([+\-*\/%~])/);

    // ORDER OF OPERATIONS: %, ~, (* or /, left to right), (+ or -, left to right)

    var percentPos = tokens.indexOf('%');
    while (percentPos !== -1) {
      var computed = +tokens[percentPos - 1] * 0.01;
      tokens = substitute(tokens, computed, percentPos);

      percentPos = tokens.indexOf('%');
    }

    var negatePos = tokens.indexOf('~');
    while (negatePos !== -1) {
      var computed = -+tokens[negatePos + 1];
      tokens = substitute(tokens, computed, negatePos);
      
      negatePos = tokens.indexOf('~');
    }

    var multOrDivPos = tokens.indexOfEither('*', '/');
    while (multOrDivPos !== -1) {

      if (tokens[multOrDivPos] === '*') {
        var computed = +tokens[multOrDivPos - 1] * +tokens[multOrDivPos + 1];
      } else {
        var computed = +tokens[multOrDivPos - 1] / +tokens[multOrDivPos + 1];
      }

      tokens = substitute(tokens, computed, multOrDivPos);
      
      multOrDivPos = tokens.indexOfEither('*', '/');
    }

    var addOrSubPos = tokens.indexOfEither('+', '-');
    while (addOrSubPos !== -1) {

      if (tokens[addOrSubPos] === '+') {
        var computed = +tokens[addOrSubPos - 1] + +tokens[addOrSubPos + 1];
      } else {
        var computed = +tokens[addOrSubPos - 1] - +tokens[addOrSubPos + 1];
      }

      tokens = substitute(tokens, computed, addOrSubPos);
      
      addOrSubPos = tokens.indexOfEither('+', '-');
    }

    var result = '' + tokens[0];
    if (result[0] === '-') {
      result = '~' + result.slice(1);
    }

    return result;
  }

});
