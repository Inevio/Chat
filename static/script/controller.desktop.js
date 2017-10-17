var win = $( this );

var controller = ( function( model, view ){

  class Controller{

    constructor( model, view ){
      this.model = model;
      this.view = view;
    }

  }

  return new Controller( model, view );

})( model, view )
