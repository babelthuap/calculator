$(document).ready(function() {
  'use strict';

  let $expression = $('#expression');

  $('#calculator div:not(#display)').click(buttonPressed);

  function buttonPressed(event) {
    console.log(event.target.id); // DEBUG

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
    } else if (buttonID === 'sign' && (isNaN(lastToken) || lastToken === '~')) {
      if (lastToken === '~') {
        $expression.text( expression.slice(0, expression.length - 1) );
      } else {
        $expression.text( expression + '~' );
      }
    } else {

      if (!isNaN(lastToken) || lastToken === '%') {
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

  function evaluate(expression) {
    let tokens = expression.split(/([+\-*\/%~])/);
    console.log(tokens);

    // ORDER OF OPERATIONS: %, ~, (* or /, left to right), (+ or -, left to right)

    var percentPos = tokens.indexOf('%');
    while (percentPos !== -1) {

      var computed = +tokens[percentPos - 1] * 0.01;

      let before = tokens.slice(0, percentPos - 1);
      let after = tokens.slice(percentPos + 2);
      tokens = before.concat([computed]).concat(after);
      
      var percentPos = tokens.indexOf('%');
    }

    var negatePos = tokens.indexOf('~');
    while (negatePos !== -1) {

      var computed = -+tokens[negatePos + 1];

      let before = tokens.slice(0, negatePos - 1);
      let after = tokens.slice(negatePos + 2);
      tokens = before.concat([computed]).concat(after);

      console.log( tokens );
      
      var negatePos = tokens.indexOf('~');
    }

    var multOrDivPos = tokens.indexOfEither('*', '/');
    while (multOrDivPos !== -1) {

      if (tokens[multOrDivPos] === '*') {
        var computed = +tokens[multOrDivPos - 1] * +tokens[multOrDivPos + 1];
      } else {
        var computed = +tokens[multOrDivPos - 1] / +tokens[multOrDivPos + 1];
      }

      let before = tokens.slice(0, multOrDivPos - 1);
      let after = tokens.slice(multOrDivPos + 2);
      tokens = before.concat([computed]).concat(after);
      
      var multOrDivPos = tokens.indexOfEither('*', '/');
    }

    var addOrSubPos = tokens.indexOfEither('+', '-');
    while (addOrSubPos !== -1) {

      if (tokens[addOrSubPos] === '+') {
        var computed = +tokens[addOrSubPos - 1] + +tokens[addOrSubPos + 1];
      } else {
        var computed = +tokens[addOrSubPos - 1] - +tokens[addOrSubPos + 1];
      }

      let before = tokens.slice(0, addOrSubPos - 1);
      let after = tokens.slice(addOrSubPos + 2);
      tokens = before.concat([computed]).concat(after);
      
      var addOrSubPos = tokens.indexOfEither('+', '-');
    }

    var result = '' + tokens[0];
    if (result[0] === '-') {
      result = '~' + result.slice(1);
    }

    return result;
  }

});

/*
  let $number = $('#number');

  // the idea is that whenever you press an operator, we evaluate
  // currentOperator(previousNumber, currentNumber), e.g. (3, +, 4) => 3+4
  // this is then stored to previousNumber
  // 
  let previousNumber, currentOperator, currentNumber;

  function buttonPressed(event) {
    console.log(event.target.id); // DEBUG
    let buttonID = event.target.id;
    let num = +$number.text();

    if (!isNaN(+buttonID) || buttonID === 'decimal') {
      // numbers
      handleNumber(buttonID);

    } else if (buttonID === "clear") {
      $number.text('0');
      previousNumber = undefined;
      currentOperator = undefined;
    } else if (buttonID === "sign") {
      $number.text( -num );
    } else if (buttonID === "percent") {
      $number.text( 0.01 * num );
    } else if (buttonID === "equals") {
      // apply();

    } else {
      // operators
      handleOperator(buttonID, previousNumber, num);
      previousNumber = num;
      currentOperator = buttonID;
    }
  }

  function handleNumber(num) {
    console.log('num:', num);

    let currentValue = $number.text();
    var newValue;

    if (num === 'decimal' && currentValue.indexOf('.') === -1) {
      newValue = currentValue + '.';
    } else if (num !== 'decimal') {
      newValue = (currentValue === '0') ? num : currentValue + '' + num;
    }

    $number.text( newValue );
  }

  // e.g. (divide, a, b) => a / b
  function handleOperator(op, a, b) {
    console.log(op, a, b);

    if (a !== undefined) {

      switch (op) {
        case add:
          console.log(op, a, b);
          $number.text(+a + +b);
          break;
        default:
          // nothing
      }

      previousNumber = undefined;
    }

  }

  // function apply() {
  //   if (callStack.length >= 3) {
  //     console.log(callStack.pop());
  //     console.log(callStack.pop());
  //     console.log(callStack.pop());
  //     console.log(callStack);
  //   }
  // }

});
*/