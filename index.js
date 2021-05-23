var each = require( 'lodash.foreach' );

module.exports = function create_instance(){
  var map = {},
      api = {},
      running = 0,
      end = { run: false };

  api.run = run_stack;
  api.end = end_stack_run;
  api.add = add_middleware;
  api.del = api.delete = delete_middleware;

  return api;

  function run_stack( hook_name, main_input ){
    if( ! hook_name || typeof hook_name !== 'string' ) throw new Error( 'name of hook is required and must be a string' );
    if( ! map[ hook_name ] ) return main_input;

    var hook_middlewares = map[ hook_name ],
        supplementary_inputs = arguments.length > 2 ? Array.prototype.splice.call( arguments, 2, arguments.length - 1 ) : [],
        middleware_args = [ main_input ].concat( supplementary_inputs ),
        stack_output = main_input;

    running += 1;

    each( hook_middlewares, function( middleware ){
      var result = middleware.apply( null, middleware_args );
      if( end.run ) return false;

      var has_result = Object.prototype.toString.call( result ) !== '[object Undefined]';
      if( has_result ){
        stack_output = result;
        middleware_args = [ stack_output ].concat( supplementary_inputs );
      }
    });

    if( end.run ){
      if( Object.prototype.toString.call( end.val ) != '[object Undefined]' ) stack_output = end.val;
      delete end.val;
      end.run = false;
    }

    running -= 1;

    return stack_output;
  }

  function end_stack_run( final_value ){
    if( running === 0 ) return;

    end.run = true;
    if( Object.prototype.toString.call( final_value ) != '[object Undefined]' ) end.val = final_value;
  }

  function delete_middleware( hook, name ){
    if( typeof hook !== 'string' || !hook ) throw new Error( 'hook name must be a string' );
    if( typeof name !== 'string' || !name ) throw new Error( 'middleware name must be a string' );

    if( map[ hook ] && map[ hook ][ name ] ) delete map[ hook ][ name ];
  }

  function add_middleware( hook, name, middleware ){
    if( typeof hook !== 'string' || !hook ) throw new Error( 'hook name must be a string' );
    if( typeof name !== 'string' || !name ) throw new Error( 'middleware name must be a string' );
    if( typeof middleware !== 'function' ) throw new Error( 'middleware must be a function' );

    if( !map.hasOwnProperty( hook ) ) map[ hook ] = {};
    if( map[ hook ][ name ] ) throw new Error( 'hook "' + hook + '" already has middleware called "' + name + '"' );

    map[ hook ][ name ] = middleware;
  }
}