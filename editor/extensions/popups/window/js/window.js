/**
 * @package      JCE Advlink
 * @copyright    Copyright (C) 2008 - 2010 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
var JCEWindowPopup = {
    /**
     * Set proportianl dimension calculations
     * @param {String} w Width
     * @param {String} h Height
     */
    setDimensions : function(w, h) {
        $.Plugin.setDimensions(w, h, 'window_popup_');
    }

};

WFPopups.addPopup('window', {
    /**
     * Initialise the player. Set various player options
     */
    setup : function() {
    },

    /**
     * Check if node is a Window Popup
     * @param {Object} n
     */
    check : function(n) {
        var ed = tinyMCEPopup.editor;
        var oc = ed.dom.getAttrib(n, 'onclick');

        return oc && /window\.open/.test(oc);
    },

    remove : function(n) {
        if (this.check(n)) {
            n.removeAttribute('onclick');
        }
    },

    /**
     * Get popup parameters
     * @param {Object} n Popup node
     */
    getAttributes: function(n) {
        var ed 		= tinyMCEPopup.editor, data = {};
        var click 	= ed.dom.getAttrib(n, 'onclick');

        var data = click.replace(/window\.open\((.*?)\);(return false;)?/, function(a, b) {
            return b;
        });

        var parts 		= data.split(",'");

        var src 		= parts[0];
        var query 		= $.String.query(src);
        var title		= (parts[1] || '').replace("'", "");
        var features	= (parts[2] || '').replace(/'$/, "");

        var data = {};

        if (query.img) {
            data.src = query.img;
        }

        $('#window_popup_title').val(title);

        // parse features
        features 	= $.String.query(features.replace(/,/g, '&'));

        $.each(features, function(k, v) {
            switch(k) {
                case 'width':
                case 'height':
                    $('#window_popup_' + k + ', #popup_' + k).val(v);
                    break;
                case 'scrollbars':
                case 'resizable':
                case 'location':
                case 'menubar':
                case 'status':
                case 'toolbar':
                    $('#window_popup_' + k).attr('checked', v == 'yes');
                    break;
                case 'top':
                case 'left':
                    v = (parseInt(v) == 0) ? k : v;
                    
                    if (/screen\.avail(Width|Height)/.test(v)) {
                        if (/[0-9]+/.test(v)) {
                        	v = 'center';
                        } else {
                        	v = (k == 'top') ? 'bottom' : 'right';
                        }
                    }
                    
                    if ($('option[value="' + v + '"]', '#window_popup_position_' + k).length == 0) {
                        $('#window_popup_position_' + k).append('<option value="' + v + '">' + v + '</option>');
                    }

                    $('#window_popup_position_' + k).val(v);

                    break;
            }
        });

    },

    /**
     * Set Popup Attributes
     * @param {Object} n Link Element
     */
    setAttributes: function(n, args) {
        var ed = tinyMCEPopup.editor, args = args || {};

        this.remove(n);

        var src 		= ed.dom.getAttrib(n, 'href');
        var title 		= $('#window_popup_title').val() || args.title || '';

        var width 		= args.width || $('#window_popup_width').val();
        var height 		= args.height || $('#window_popup_height').val();

        var href 		= src;
        var query 		= 'this.href';

        // if its an image..
        if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(src)) {
            var params 	= {
                img 	: src,
                title 	: title.replace(' ', '_', 'gi'),
                width	: width,
                height	: height
            };

            href 	= 'index.php?option=com_jce&tmpl=component&view=popup';
            query 	= "this.href+'" + (/\?/.test(query) ? '&' : '?') + decodeURIComponent($.param(params)) + "'";
        }

        var features = {
            'width'		: width,
            'height' 	: height,
            'top'		: 0,
            'left'		: 0
        };

        var top = $('#window_popup_position_top').val();

        switch(top) {
            case 'top':
                top = 0;
                break;
            case 'center':
                top = "'+(screen.availHeight/2-" + (height/2) + ")+'";
                break;
            case 'bottom':
                top = "'+(screen.availHeight-" + height + ")+'";
                break;
        }

        var left = $('#window_popup_position_left').val();

        switch($('#window_popup_position_left').val()) {
            case 'left':
                left = 0;
                break;
            case 'center':
                left = "'+(screen.availWidth/2-" + (width/2) + ")+'";
                break;
            case 'right':
                left = "'+(screen.availWidth-" + width + ")+'";
                break;
        }
        
        var features = {
        	'scrollbars' 	: 'yes',
        	'resizable' 	: 'yes',
        	'location' 		: 'yes',
        	'menubar' 		: 'yes',
        	'status' 		: 'yes',
        	'toolbar' 		: 'yes'
        };

        $.each(features, function(k, def) {
            var v = $('#window_popup_' + k).is(':checked') ? 'yes' : 'no';
            
            if (v == def) {
            	return;
            }

            features[k] = v;
        });
        
        $.extend(features, {
        	'width' : width,
        	'height': height,
        	'left' 	: left,
        	'top'	: top
        });

        ed.dom.setAttrib(n, 'href', href);
        ed.dom.setAttrib(n, 'onclick', "window.open(" + query + ",'" + encodeURIComponent(title) + "','" + decodeURIComponent($.param(features)).replace(/&/g, ',') + "');return false;");
    }

});