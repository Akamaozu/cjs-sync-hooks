var assert = require( 'assert' ),
    hooks = require('../index');

describe( 'About Main Export', function(){
  it( 'is a function', function(){
    assert( typeof hooks, 'function', 'hooks module export is not a function' );
  });
});

describe( 'Instantiated Hooks Properties', function(){
  var hook = hooks(),
      expected_props = [
        { name: 'add', type: 'function' },
        { name: 'del', type: 'function' },
        { name: 'run', type: 'function' },
        { name: 'end', type: 'function' },
        { name: 'delete', type: 'function' }
      ];

  describe( 'has all expected properties', function(){
    expected_props.forEach( function( prop ){

      it( ' has expected "' + prop.name + '" ' + prop.type, function(){
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
      it( 'property "' + prop_name + '" is expected', function(){
        assert.equal( expected_prop_names.indexOf( prop_name ) > -1, true, 'hook instance has unexpected property "' + prop_name + '"' );
      });
    }
  });
});