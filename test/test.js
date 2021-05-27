var assert = require( 'assert' ),
    hooks = require('../index');

describe( 'About Main Export', function(){
  it( 'is a function', function(){
    assert( typeof hooks, 'function', 'hooks module export is not a function' );
  });
});

describe( 'Hook Instance Properties', function(){
  var hook = hooks(),
      expected_props = [
        { name: 'add', type: 'function' },
        { name: 'del', type: 'function' },
        { name: 'run', type: 'function' },
        { name: 'end', type: 'function' },
        { name: 'delete', type: 'function' },
        { name: 'list', type: 'function' }
      ];

  describe( 'has all expected properties', function(){
    expected_props.forEach( function( prop ){

      it( 'has expected "' + prop.name + '" ' + prop.type, function(){
        assert.equal( hook.hasOwnProperty( prop.name ), true, 'hook instance is missing "' + prop.name + '" property' );

        switch( prop.type ){
          case 'function':
            assert.equal( typeof hook[ prop.name ] == 'function', true );
          break;

          default:
            throw new Error( 'no test defined for "' + prop.type + '" properties' );
          break;
        }
      });
    });
  });

  describe( 'has no unexpected properties', function(){
    var expected_prop_names = [];

    expected_props.forEach( function( prop ){
      expected_prop_names.push( prop.name );
    });

    for( var prop_name in hook ){
      if( !hook.hasOwnProperty( prop_name ) ) continue;

      (function( current_prop_name ){
        it( 'property "' + current_prop_name + '" is expected', function(){
          assert.equal( expected_prop_names.indexOf( current_prop_name ) > -1, true, 'hook instance has unexpected property "' + current_prop_name + '"' );
        });
      })( prop_name );
    }
  });

  describe( 'hook.del', function(){
    it( 'is an alias for hook.delete', function(){
      assert.equal( hook.del === hook.delete, true, 'hook.del is not strictly equal to hook.delete' );
    });
  });
});

describe( 'Hook Instance Function Behavior', function(){
  var datatypes = [
    { name: 'function', example: function(){} },
    { name: 'string', example: 'hello world' },
    { name: 'object', example: {} },
    { name: 'null', example: null },
    { name: 'number', example: 1 },
    { name: 'array', example: [] },
    { name: 'undefined' }
  ];

  describe( 'hook.add', function(){
    it( 'requires three arguments: string string function', function(){
      var hook = hooks(),
          didnt_throw_error = [];

      datatypes.forEach( function( first ){
        datatypes.forEach( function( second ){
          datatypes.forEach( function( third ){
            try{
              hook.add( first.example, second.example, third.example );
              didnt_throw_error.push([ first, second, third ]);
            }
            catch(e){}
          });
        });
      });

      assert.equal( didnt_throw_error.length > 0, true, 'could not find a combination of three arguments to successfully run add' );

      didnt_throw_error.forEach( function( fn_signature ){
        var first = fn_signature[0],
            second = fn_signature[1],
            third = fn_signature[2];

        assert.equal( first.name, 'string', 'function ran when first argument was a ' + first.name );
        assert.equal( second.name, 'string', 'function ran when second argument was a ' + second.name );
        assert.equal( third.name, 'function', 'function ran when third argument was a ' + third.name );
      });
    });

    it( 'adds middleware (function argument) to be executed when associated hook (first string argument) is run', function(){
      var hook = hooks(),
          hook_name = 'test',
          ran = false;

      hook.add( hook_name, 'modify-ran-flag', function(){
        ran = true;
      });

      hook.run( hook_name );
      assert.equal( ran, true, 'function was not executed when hook ran' );
    });

    it( 'throws error if hook already has a middleware with the name (second string argument) given', function(){
      var hook = hooks(),
          hook_name = 'test',
          middleware_name = 'jj2',
          failed = false;

      hook.add( hook_name, middleware_name, function(){} );
      try{
        hook.add( hook_name, middleware_name, function(){} );
      }
      catch(e){
        failed = true;
      }

      assert.equal( failed, true, 'attempt to add second middleware by the same name did not fail' );
    });
  });

  describe( 'hook.del', function(){
    it( 'requires two arguments: string string', function(){
      var hook = hooks(),
          didnt_throw_error = [];

      datatypes.forEach( function( first ){
        datatypes.forEach( function( second ){
          try{
            hook.del( first.example, second.example );
            didnt_throw_error.push([ first, second ]);
          }
          catch(e){}
        });
      });

      assert.equal( didnt_throw_error.length > 0, true, 'could not find a combination of two arguments to successfully run del/delete' );

      didnt_throw_error.forEach( function( fn_signature ){
        var first = fn_signature[0],
            second = fn_signature[1];

        assert.equal( first.name, 'string', 'function ran when first argument was a ' + first.name );
        assert.equal( second.name, 'string', 'function ran when second argument was a ' + second.name );
      });
    });

    it( 'removes middleware (second string argument) from hook (first string argument) execution stack', function(){
      var hook = hooks(),
          hook_name = 'test',
          middleware_name = 'incrementer',
          executed = 0;

      hook.add( hook_name, middleware_name, function(){
        executed += 1;
      });

      hook.run( hook_name );
      assert.equal( executed === 1, true, 'added middleware did not run when expected' );

      hook.del( hook_name, middleware_name );
      hook.run( hook_name );
      assert.equal( executed != 2, true, 'added middleware ran after it was supposed to be deleted' );
    });
  });

  describe( 'hook.run', function(){
    it( 'requires one function argument: string', function(){
      var hook = hooks(),
          didnt_throw_error = [];

      datatypes.forEach( function( first ){
        try{
          hook.run( first.example );
          didnt_throw_error.push([ first ]);
        }
        catch(e){}
      });

      assert.equal( didnt_throw_error.length > 0, true, 'could not find an argument datatype to successfully execute hook.run' );

      didnt_throw_error.forEach( function( fn_signature ){
        var first = fn_signature[0];

        assert.equal( first.name, 'string', 'function ran when first argument was a ' + first.name );
      });
    });

    it( 'executes middleware functions added to a hook', function(){
      var hook = hooks(),
          hook_name = 'test',
          executed = false;

      hook.add( hook_name, 'trigger-flag', function(){
        executed = true;
      });

      hook.run( hook_name );

      assert.equal( executed, true, 'middleware added to hook not executed' );
    });
  });

  describe( 'hook.end', function(){
    it( 'ends the execution of a currently-running hook', function(){
      var hook = hooks(),
          steps_executed = 0,
          expected_executions = 2;

       hook.add( 'test', 'first-increment', increment_executed_steps );
       hook.add( 'test', 'second-increment', increment_executed_steps );

       hook.add( 'test', 'end', function(){
         hook.end();
       });

       hook.add( 'test', 'third-increment', increment_executed_steps );

       hook.run( 'test' );

       assert.equal( steps_executed, expected_executions, 'executions expected ('+ expected_executions +'), observed executions ('+ steps_executed + ')' );

       function increment_executed_steps(){
         steps_executed += 1;
       }
    });

    it( 'throws error if no hook is running', function(){
      var hook = hooks(),
          error_thrown = false;

      try {
        hook.end();
      }

      catch( error ){
        error_thrown = true;
      }

      assert.equal( error_thrown, true, 'expected error to br thrown, but none was' );
    });
  });

  describe( 'hook.list', function(){
    it( 'will return all middlewares on all hooks, if given no arguments', function(){
      var hook = hooks(),
          hook_ids = [],
          middleware_ids = [],
          instances_to_generate = 44,
          generated = 0;

      while( generated < instances_to_generate ){
        var index = generated;

        hook_ids[ index ] = Math.floor( Math.random() * instances_to_generate ) + 1;
        middleware_ids[ index ] = Math.floor( Math.random() * instances_to_generate ) + 1;

        try {
          hook.add( 'test-'+ hook_ids[ index ], 'middleware-'+ middleware_ids[ index ], hook_middleware );
          generated += 1;
        }
        catch( error ){
          // do nothing
        }
      }

      var hook_list = hook.list();

      hook_ids.forEach( function( hook_id, index ){
        var hook_name = 'test-'+ hook_id;
        assert.equal( hook_list.hasOwnProperty( hook_name ), true, 'expected hook "'+ hook_name +'" to be listed' );

        var middleware_name = 'middleware-' + middleware_ids[ index ];
        assert.equal( hook_list[ hook_name ].indexOf( middleware_name ) > -1, true, 'expected middleware "'+ middleware_name +'" to be registered to hook "'+ hook_name +'"' );
      });

      function hook_middleware( main_input ){
        console.log( 'main input:', main_input );
      }
    });

    it( 'will return middleware for hook specified (first argument)', function(){
      var hook = hooks(),
          hook_ids = [],
          middleware_ids = [],
          instances_to_generate = 44,
          generated = 0;

      while( generated < instances_to_generate ){
        var index = generated;

        hook_ids[ index ] = Math.floor( Math.random() * instances_to_generate ) + 1;
        middleware_ids[ index ] = Math.floor( Math.random() * instances_to_generate ) + 1;

        try {
          hook.add( 'test-'+ hook_ids[ index ], 'middleware-'+ middleware_ids[ index ], hook_middleware );
          generated += 1;
        }
        catch( error ){
          // do nothing
        }
      }

      var instance_to_check = Math.floor( Math.random() * instances_to_generate ),
          hook_to_check = 'test-' + hook_ids[ instance_to_check ],
          middleware_to_check = 'middleware-' + middleware_ids[ instance_to_check ],
          hook_list = hook.list( hook_to_check  );

      assert.equal( hook_list.indexOf( middleware_to_check ) > -1, true, 'expected hook "'+ hook_to_check + '" to have middleware "'+ middleware_to_check +'"' );

      function hook_middleware( main_input ){
        console.log( 'main input:', main_input );
      }
    });

    it( 'will throw an error if first argument given is not a string', function(){
      var hook = hooks(),
          didnt_throw_error = [];

      datatypes.forEach( function( type ){
        if( type.name == 'undefined' ) return;

        try {
          hook.list( type.example );
          didnt_throw_error.push( type.name );
        }

        catch( error ){
        }
      });

      assert.equal( didnt_throw_error.length === 1, true, 'expected only one argument type to not throw an error' );
      assert.equal( didnt_throw_error.indexOf( 'string' ) > -1, true, 'expected successfully-executed argument type to be "string"' );
    });
  });
});

describe( 'Hook Stack Run Behavior', function(){
  it( 'additional arguments (any after the first required string) are passed to middleware in its execution stack', function(){
    var hook = hooks(),
        first_additional_arg = 'a',
        second_additional_arg = 'b',
        third_additional_arg = 'c';

    hook.add( 'test', 'test-single-arg-pass', function( first ){
      assert.equal( first, first_additional_arg, 'additional argument does not match what was passed' );
    });

    hook.run( 'test', first_additional_arg );
    hook.delete( 'test', 'test-single-arg-pass' );

    hook.add( 'test', 'test-multi-arg-pass', function( first, second, third ){
      assert.equal( first, first_additional_arg, 'first additional argument does not match what was passed' );
      assert.equal( second, second_additional_arg, 'second additional argument does not match what was passed' );
      assert.equal( third, third_additional_arg, 'third additional argument does not match what was passed' );
    });

    hook.run( 'test', first_additional_arg, second_additional_arg, third_additional_arg );
  });

  it( 'returns the return value of the last executed middleware', function(){
    var hook = hooks(),
        expected_return_value = 'last-return-value',
        last_return_value;

    hook.add( 'test', 'return-value', function(){
      return expected_return_value;
    });

    last_return_value = hook.run( 'test' );

    assert.equal( last_return_value, expected_return_value, 'returned value is not what was expected' );
  });

  it( 'returns the first additional argument if there is no middleware in hook\'s stack', function(){
    var hook = hooks(),
        first_additional_arg = 'hello tester',
        second_additional_arg = 'hello testers';

    // single additional arg test
    var result = hook.run( 'test', first_additional_arg );
    assert.equal( result, first_additional_arg, 'hook.run return value is not the same as additional arg' );

    // multiple additional arg test
    var result = hook.run( 'test', first_additional_arg, second_additional_arg );
    assert.equal( result, first_additional_arg, 'hook.run return value is not the same as additional arg' );
  });

  it( 'will return first additional argument if no middleware returns any value', function(){
    var hook = hooks(),
        first_additional_arg = 'first',
        second_additional_arg = 'second',
        result;

    // single additional arg test
    hook.add( 'test', 'do-nothing', function(){} );

    result = hook.run( 'test', first_additional_arg );

    assert.equal( result, first_additional_arg, 'result does not match input given. expected: "' + first_additional_arg + '" received: "' + result + '"' );

    // cleanup
    result = null;

    // multiple additional args test
    result = hook.run( 'test', first_additional_arg, second_additional_arg );

    assert.equal( result, first_additional_arg, 'result does not match input given. expected: "' + first_additional_arg + '" received: "' + result + '"' );
  });
});

describe( 'Hook Stack Premature End Behavior', function(){

  it( 'returns the end value specified', function(){
    var hook = hooks(),
        end_value = 5;

    hook.add( 'test', 'hello', function(){
      return 'hello';
    });

    hook.add( 'test', 'prematurely-end-stack', function(){
      hook.end( end_value );
    });

    hook.add( 'test', 'world', function(){
      return 'world';
    });

    var return_value = hook.run( 'test' );

    assert.equal( return_value, end_value, 'returned value ('+ return_value +') is not what was expected ('+ end_value +')' );
  });

  it( 'returns the output of the last executed middleware if no end value is specified', function(){
    var hook = hooks(),
        initial_value = 5,
        expected_return_value = square_integer( initial_value );

    hook.add( 'test', 'square-integer', square_integer );

    hook.add( 'test', 'prematurely-end-stack', function(){
      hook.end();
    });

    var return_value = hook.run( 'test', initial_value );

    assert.equal( return_value, expected_return_value, 'returned value ('+ return_value +') is not what was expected ('+ expected_return_value +')' );

    function square_integer( integer ){
      if( typeof integer != 'number' || integer % 1 != 0 ) throw new Error( 'input ('+ integer +') is not an integer' );
      return integer * integer;
    }
  });
});