

/***
type:    What type of resource
        JS
        CSS

mode:    Mode of data.
        INLINE
        EXTERNAL
        REPLACE
        
data:    The data

pos:    Target
        HEAD
        BODY_PREFIX
        BODY_SUFFIX
***/

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

function Trax( nextUrl ){

    var data = {
        url        : nextUrl,
        resources  : []
    };
    
    this.addResource = function( in_type, in_mode, in_pos, in_data ){
        data.resources.push({
            type         : in_type,
            mode         : in_mode,
            position     : in_pos,
            data         : in_data            
        });
    };
    
    this.loggit = function( s, t ) {
        var msg = [ 'Message', 'Warning', 'Error' ];
        var name = arguments.callee.caller.name.length > 1 ? arguments.callee.caller.name : '??';
        if( !(typeof console === 'undefined') ) console.log( '> Trax ' + msg[ t || 0 ] + ' [' + name + ']: ' + s ); 
    };
    
    this.run = function(){
        loggit( "Attempting move to " + data.url );
    
        $.ajax({
            url : data.url,
            success : function(html, status, xhr){
                loggit( status );
                
                //Apply changes to the source.
                $.each( data.resources, function(i,e){
                
                    switch( e.mode ){
                        case 'REPLACE': break;
                        case 'INLINE':

                            var opt = { 
                                'JS' : [ '<script>', '</script>' ],
                                'CSS' : [ '<style>', '</style>' ]
                            };
                            var positions = { 
                                'HEAD_PREFIX' : { tag : /<[^\/]?head.+?(?=>)/, after : true },
                                'HEAD_SUFFIX' : { tag : /<[^\/]?\/[^\/]?head.??(?=>)/, after : false },
                                'BODY_PREFIX' : { tag : /<[^\/]?body.+?(?=>)/, after : true },
                                'BODY_SUFFIX' : { tag : /<[^\/]?\/[^\/]?body.??(?=>)/, after : false }
                            };
                            var cPos = positions[ e.position ];
                            var tagPos = html.search( cPos.tag );
                            
                            //Insert the string into the document.
                            if( tagPos !== -1 ){
                                var textToInsert = opt[ e.type ][ 0 ] + e.data + opt[ e.type ][ 1 ];
                                tagPos += cPos.after ? cPos.tag.length : -1;
                                html = html.splice( tagPos, 0, textToInsert );
                            }
                            break;
                        case 'EXTERNAL': break;                        
                    };
                });
                
                //Move to next.
                document.open();
                document.write( html );
                document.close();
            },
            error : function(xhr, status, error){
                loggit( status + (error.length ? ', ' + error : ''), 2 );
            }
        });
    
    };
    this.loggit( "Trax instance started." );
    this.addResource( 'JS', 'INLINE', 'BODY_PREFIX', "alert('working');" );
    this.run();
}


