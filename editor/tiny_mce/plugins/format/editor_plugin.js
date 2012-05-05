/**
* @version		$Id: editor_plugin.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL 2 - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
(function() {
    tinymce.create('tinymce.plugins.FormatPlugin', {
        init : function(ed, url) {
            var t = this;
            this.editor = ed;

            var blocks = 'p,div,address,pre,h1,h2,h3,h4,h5,h6,dl,dt,dd,code,samp';
			
            function isBlock(n) {
                return new RegExp('^(' + blocks.replace(',', '|', 'g') + ')$', 'i').test(n.nodeName);
            }
			
            // Format Block fix
            ed.onBeforeExecCommand.add(function(ed, cmd, ui, v, o) {
                var n = ed.selection.getNode(), p;
                switch (cmd) {
                    case 'FormatBlock':
                        if (!v) {
                            ed.undoManager.add();
                            p = ed.dom.getParent(n, blocks);
                            if (p) {
                                ed.formatter.toggle(p.nodeName.toLowerCase());
                            }
                            o.terminate = true;
                        }

                        break;
                    case 'RemoveFormat':
                        if (!v && isBlock(n)) {
                            ed.undoManager.add();
                            p = ed.dom.getParent(n, blocks);
                            if (p) {
                                ed.formatter.toggle(p.nodeName.toLowerCase());
                            }	
                            o.terminate = true;
                        }
                        break;
                }
            });
			
            t.onClearBlocks = new tinymce.util.Dispatcher(t);		
            tinymce.isChrome = tinymce.isWebkit && /chrome/i.test(navigator.userAgent);

            ed.onKeyUp.add(function(ed, e) {				
                if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode == 13) || e.keyCode == 10) {
                    e.preventDefault();
					
                    t._clearBlocks(e);
                    // Execute post process handlers
                    t.onClearBlocks.dispatch(t);
                }
            });
        },
		
        _select : function(el) {
            var ed = this.editor, s = ed.selection, pos, br, r, fn;
			
            if (tinymce.isIE) {
                s.select(el.firstChild);
                s.collapse(0);

                r 		= s.getRng();
                fn 		= s.getNode().firstChild;
                br 		= fn.nodeName == 'BR' && fn.getAttribute('mce_bogus');
                pos 	= br ? -1 : -2;
				
                r.move('character', pos);
                r.select();
                if(br) {
                    ed.dom.remove(fn);
                }
				
            } else {
                r = ed.getDoc().createRange();
                r.setStart(el, 0);
                r.setEnd(el, 0);
                s.setRng(r);
            }
        },
		
        _clearBlocks : function(ed, e) {
            var ed = this.editor, dom = ed.dom, s, p, a = [], b, bm;	
			
            // Get the element to use
            var tag = ed.getParam('forced_root_block');
			
            if (!tag) {
                tag = ed.getParam('force_p_newlines') ? 'p' : 'br';
            }			
			
            n = ed.selection.getNode();
			
            // Find parent element just before the document body
            p = dom.getParent(n, function(s){
                a.push(s);
            }, ed.getBody());
							
            // create element
            var el 	= dom.create(tag);
            var h 	= (tag == 'br') ? '' : '<br _mce_bogus="1" />';
            dom.setHTML(el, h);	
			
            // insert after parent element
            dom.insertAfter(el, a[a.length - 1]);
            // move caret to element position
            this._select(el);
        },
		
        getInfo : function() {
            return {
                longname : 'Format',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('format', tinymce.plugins.FormatPlugin);
})();