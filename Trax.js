
/***
	Copyright 2015 Christopher Andrews.
***/

function loggit( s, t ) {
	var msg = [ 'Message', 'Warning', 'Error' ];
	var name = arguments.callee.caller.name.length > 1 ? arguments.callee.caller.name : '??';
	if( !(typeof console === 'undefined') ) console.log( '> Trax ' + msg[ t || 0 ] + ' [' + name + ']: ' + s ); 
};

function Trax( nextUrl ){

    var data = {
	
		
		url       : nextUrl, 
		resources : [],
		options   : { 'JS' : 'script', 'CSS' : 'style' },
		positions : { 
			'HEAD_PREFIX' : { tag : /<[^\/]?head.+?(?=>)/, after : true },
			'HEAD_SUFFIX' : { tag : /<[^\/]?\/[^\/]?head.??(?=>)/, after : false },
			'BODY_PREFIX' : { tag : /<[^\/]?body.+?(?=>)/, after : true },
			'BODY_SUFFIX' : { tag : /<[^\/]?\/[^\/]?body.??(?=>)/, after : false }
		}
	};

	this.wrapData = function( tag, str, attr ){
		return '<' + tag + ' ' + (attr || '') + '>' + str + '</' + tag + '>'; 
	};
    
    this.addResource = function( in_type, in_mode, in_pos, in_data, beginning, in_cache ){
	
		var toInsert = {
            type         : in_type,
            mode         : in_mode,
            position     : in_pos,
            data         : in_data,
			cache        : (typeof in_cache === 'undefined') ? true : in_cache
        };
		
		if( beginning || false ){
			data.resources.unshift(toInsert);
		}else{
			data.resources.push(toInsert);
		}
		return this;
    };
    
    this.run = function( forwardTrax ){
	
		if( typeof String.prototype.splice === 'undefined' ){
			String.prototype.splice = function( idx, rem, s ) {
				return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
			};
		}
	
		if( typeof forwardTrax === 'boolean' ? forwardTrax : true ){
		
			var script =	"var __Trax__='true',__Trax_This_URL__='" + data.url + "';" + Trax.toString();
			this.addResource( 'JS', 'INLINE', 'HEAD_SUFFIX', script, true );
		}
	
        loggit( "Attempting move to " + data.url );
		
		var that = this;
    
        $.ajax({
            url : data.url,
            success : function(html, status, xhr){

                // Apply changes to the source.
                $.each( data.resources, function(i,e){
                
                    var cPos = data.positions[ e.position ];
                    var tagPos = html.search( cPos.tag );
					var textToInsert;
					
					if( tagPos !== -1 ){
					
						switch( e.mode ){
							case 'REPLACE': break;
							case 'INLINE': // Insert the string into the document.
								textToInsert = that.wrapData( data.options[ e.type ], e.data );
								break;
							case 'EXTERNAL': 
								textToInsert = that.wrapData(data.options[ e.type ], '', 'src="' + e.data + '"' );
								break;
							case 'IMPORT':
								break;
						};
						tagPos += cPos.after ? cPos.tag.length : -1;
						html = html.splice( tagPos, 0, textToInsert );
					}
                });
                
                // Swap the page entry.
                document.open();
				//document.location.href = data.url;
                document.write( html );
                document.close();
				
				
				// Update the history.
            },
            error : function(xhr, status, error){ loggit( status + (error.length ? ', ' + error : ''), 2 ); }
        });
    };
	
	
    loggit( "Trax instance started." );
	
	//TODO: Load history.js if needed.
}




/*								$.ajax( e.data, {
									data : 'text',
									cache : e.cache,
									success : function(){
									
									},
									error : function (){
									
									}
								});
								that.wrapData(opt[ e.type ],  );*/