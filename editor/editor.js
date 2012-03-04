/*
	Javascript WYSIWYM Editor
	
	@author		     Fadion Dashi
	@license         MIT Licens
	@dependables     jQuery, RangyInputs
*/

var Editor = {

	config: {
		selector: '.editor', // the selector (id or class) of the textarea that will be converted
		skin: 'simplium', // the skin that will be used. The actual files should exist under the "skins" folder
		width: 600, // editor width. Lower then 600 will break icon position
		lang: 'en', // language. An actual file should exist with the appropriate name (en => en.js, de => de.js)
		path: 'editor', // the folder where the editor files are. No slashes (/).
	},
	
	lang_vars: {}, // will be filled with language variables
	
	/*
		Initialize the Editor
	*/
	loadEditor: function(config){
		$.extend(this.config, config);
		
		if ($(this.config.selector).length) {
			/*
				Include RangyInputs dynamically
			*/
			$.getScript(this.config.path + '/jquery/rangyinputs.jquery.js');
			
			/*
				Make an AJAX call to include the language variables and pass the output to lang_vars
			*/
			$.ajax({
				url: this.config.path + '/lang/' + this.config.lang + '.js',
				dataType: 'json',
				async: false,
				success: function(data){
					Editor.lang_vars = data;
				},
				error: function() {
					alert('Language not found!');	
				}
			});

			this.createHTML();
			this.createIcons();
			this.catchEvents();
			
		}
	},
	
	/*
		Catches various events
	*/
	catchEvents: function(){
		/*
			Menus events
		*/
		$('#editorIcons a, #editorSmileys a').click(function(){
			/*
				Icons are recognized by the rel attribute
			*/
			icon = $(this).attr('rel');
			icon_long = '';
			/*
				Build a selector based on the name
			*/
			switch (icon) {
				case 'font':
					icon_long = '#editorFont';
					break;
				case 'color':
					icon_long = '#editorColors';
					break;
				case 'smileys':
					icon_long = '#smileys-popup';
			}
			
			/*
				If it's one of the menu icons
			*/
			if (icon_long != '') {
				/*
					Positions the menu based on the parent icon position and fade it
				*/
				$(icon_long).css({
					'top': $(this).position().top + 25,
					'left': $(this).position().left - $(icon_long).width()/2
				}).fadeIn(300);
				
				/*
					Close other potentially opened menu
				*/
				$('#editorColors, #smileys-popup, #editorFont').not(icon_long).fadeOut(300);
				return false;
			}
			
			/*
				If it got here, the click was on a item that doesn't have a menu. Run the
				function to find the BB Code
			*/
			Editor.findBBCode(icon);
		});
		
		/*
			Find BB Codes of the icons in the Font and Colors menu
		*/
		$('#editorFont li a, #editorColors a').click(function(){
			Editor.findBBCode($(this).attr('rel'));
		});
		
		/*
			Find the Smiley
		*/
		$('#smileys-popup a').click(function(){
			Editor.findSmiley($(this).attr('rel'));
		});
		
		/*
			Hide the menus if it's clicked anywhere in the document
		*/
		$(document).click(function(){
			$('#editorFont, #editorColors, #smileys-popup').fadeOut('slow');
		});
		
		/*
			Shortcut events. First see if it's pressed CTRL or CMS (metakey)
			and listen for a combination
		*/
		$('#editorWrapper textarea').keydown(function(e){
			if (e.ctrlKey || e.metaKey) {
				if (e.keyCode == 66) {
					Editor.addBBCode('[b]', '[/b]');
					return false;
				}
				if (e.keyCode == 73) {
					Editor.addBBCode('[i]', '[/i]');
					return false;
				}
				if (e.keyCode == 85) {
					Editor.addBBCode('[u]', '[/u]');
					return false;
				}
				if (e.keyCode == 76) {
					Editor.addBBCode('[url=]', '[/url]');
					return false;
				}
			}
		});
	},
	
	/*
		Finds the BB Code associated with the icon name
	*/
	findBBCode: function(icon){
		/*
			If it's a color icon, proccess it further to remove unwanted characters.
			Colors have "color-" prepended, so it needs to be removed
		*/
		if (icon.indexOf('color') != -1) {
			icon = icon.replace('color-', '');
			this.addBBCode('[color=' + icon + ']', '[/color]');
			return false;
		}
		
		/*
			Associate the icon name with the actual BB Code
		*/
		switch (icon) {
			case 'bold':
				this.addBBCode('[b]', '[/b]');
				break;
			case 'italic':
				this.addBBCode('[i]', '[/i]');
				break;
			case 'underline':
				this.addBBCode('[u]', '[/u]');
				break;
			case 'strikethrough':
				this.addBBCode('[s]', '[/s]');
				break;
			case 'bullets':
				this.addBBCode('[list]\n[*]', '\n[/list]');
				break;
			case 'numbers':
				this.addBBCode('[list=1]\n[*]', '\n[/list]');
				break;
			case 'list_item':
				this.addBBCode('[*]', '');
				break;
			case 'link':
				this.addBBCode('[url=]', '[/url]');
				break;
			case 'picture':
				this.addBBCode('[img]', '[/img]');
				break;
			case 'video':
				this.addBBCode('[youtube]', '[/youtube]');
				break;
			case 'quote':
				this.addBBCode('[quote]', '[/quote]');
				break;
			case 'code':
				this.addBBCode('[code]', '[/code]');
				break;
			case 'font60':
				this.addBBCode('[font=60]', '[/font]');
				break;
			case 'font80':
				this.addBBCode('[font=80]', '[/font]');
				break;
			case 'font100':
				this.addBBCode('[font=100]', '[/font]');
				break;
			case 'font120':
				this.addBBCode('[font=120]', '[/font]');
				break;
			case 'font140':
				this.addBBCode('[font=140]', '[/font]');
				break;
		}
	},
	
	/*
		Adds the BB Code in the textarea.
		"bb_start" is the starting tag (ie: [b]).
		"bb_end" is the ending tag (ie: [/b]).
	*/
	addBBCode: function(bb_start, bb_end){
		textarea = $('#editorWrapper textarea');
		textarea.focus(); /* Fix for IE */
		
		/*
			Get the starting and ending position of the selection
		*/
		range = textarea.getSelection();
		
		/*
			range.start is equal to range.end when there's nothing selected.
			The BB Code is inserted at the cursor position and the cursor
			is moved as many characters as the length of bb_end
		*/
		if (range.start == range.end) {
			textarea.insertText(bb_start + bb_end, range.start);
			textarea.setSelection(range.start + bb_start.length);
		} else {
			/*
				This will happen if there's some text selected and it will
				be wrapped with tags
			*/
			textarea.surroundSelectedText(bb_start, bb_end);
		}
		
		textarea.focus(); /* Fix for Firefox */
		
	},
	
	/*
		Finds the Smiley associated with the icon name
	*/
	findSmiley: function(smiley){
		switch (smiley) {
			case 'smile':
				this.addSmiley(':)');
				break;
			case 'grin':
				this.addSmiley(':D');
				break;
			case 'sad':
				this.addSmiley(':(');
				break;
			case 'wink':
				this.addSmiley(';)');
				break;
			case 'confused':
				this.addSmiley(':o');
				break;
			case 'tongue':
				this.addSmiley(':P');
				break;
			case 'shy':
				this.addSmiley(':$');
				break;
			case 'angry':
				this.addSmiley(':@');
				break;
			case 'dislike':
				this.addSmiley(':S');
				break;
			case 'boss':
				this.addSmiley('$-)');
				break;
		}
	},
	
	/*
		Add the smiley
	*/
	addSmiley: function(code){
		textarea = $('#editorWrapper textarea');
		textarea.focus(); /* Fix for IE */
		range = textarea.getSelection();

		if (range.start == range.end) {
			/*
				The BB Code is inserted at the cursor position and the cursor
				is moved as many characters as the length of the smiley
			*/
			textarea.insertText(code, range.start, true);
		} else {
			/*
				Replace the selected text with the smiley
			*/
			textarea.replaceSelectedText(code);
		}
		
		textarea.focus(); /* Fix for Firefox */
	},
	
	/*
		Creates the needed HTML structure
	*/
	createHTML: function(){
		/*
			The name attribute of the textarea is attached to the dynamically created editor,
			so it can be retrieved by a script via POST or GET
		*/
		textarea_name = $(this.config.selector).attr('name');
		
		$(this.config.selector).replaceWith('<div id="editorWrapper" style="width:' + this.config.width + 'px"></div>');
		$('#editorWrapper').html('<div id="editorToolbar"><ul id="editorIcons"></ul><ul id="editorSmileys"></ul></div><textarea></textarea><div id="editorShadow"><div id="shadow-left"></div><div id="shadow-middle"></div><div id="shadow-right"></div></div><ul id="editorFont"></ul><div id="editorColors"></div><div id="smileys-popup"></div>');
		
		/*
			Hide the menus
		*/
		$('#editorFont, #editorColors, #smileys-popup').hide();
		/*
			Some calculations to place the shadows (made of 3 parts) in the right positions
		*/
		$('#shadow-middle').css('width', this.config.width - ($('#shadow-left').width() + $('#shadow-right').width()) + 'px');
		$('#editorWrapper').find('textarea').attr('name', textarea_name);
	},
	
	/*
		Creates the HTML code for the icons and smileys
	*/
	createIcons: function(){
		html = '';
		
		html  = '<li><a rel="bold"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/bold.png" alt="' + this.lang_vars.bb_bold + '" title="' + this.lang_vars.bb_bold + '" /></a></li>';
		html += '<li><a rel="italic"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/italic.png" alt="' + this.lang_vars.bb_italic + '" title="' + this.lang_vars.bb_italic + '" /></a></li>';
		html +='<li><a rel="underline"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/underline.png" alt="' + this.lang_vars.bb_underline + '" title="' + this.lang_vars.bb_underline + '" /></a></li>';
		html +='<li><a rel="strikethrough"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/strikethrough.png" alt="' + this.lang_vars.bb_strikethrough + '" title="' + this.lang_vars.bb_strikethrough + '" /></a></li>';
		html +='<li><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/seperator.png" alt="' + this.lang_vars.seperator + '" /></li>';
		html +='<li><a rel="bullets"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/bullets.png" alt="' + this.lang_vars.bb_bullets + '" title="' + this.lang_vars.bb_bullets + '" /></a></li>';
		html +='<li><a rel="numbers"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/numbers.png" alt="' + this.lang_vars.bb_numbers + '" title="' + this.lang_vars.bb_numbers + '" /></a></li>';
		html +='<li><a rel="list_item"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/list_item.png" alt="' + this.lang_vars.bb_item + '" title="' + this.lang_vars.bb_item + '" /></a></li>';
		html +='<li><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/seperator.png" alt="' + this.lang_vars.seperator + '" /></li>';
		html +='<li><a rel="link"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/link.png" alt="' + this.lang_vars.bb_link + '" title="' + this.lang_vars.bb_link + '" /></a></li>';
		html +='<li><a rel="picture"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/picture.png" alt="' + this.lang_vars.bb_picture + '" title="' + this.lang_vars.bb_picture + '" /></a></li>';
		html +='<li><a rel="video"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/video.png" alt="' + this.lang_vars.bb_video + '" title="' + this.lang_vars.bb_video + '" /></a></li>';
		html +='<li><a rel="quote"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/quote.png" alt="' + this.lang_vars.bb_quote + '" title="' + this.lang_vars.bb_quote + '" /></a></li>';
		html +='<li><a rel="code"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/code.png" alt="' + this.lang_vars.bb_code + '" title="' + this.lang_vars.bb_code + '" /></a></li>';
		html +='<li><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/seperator.png" alt="' + this.lang_vars.seperator + '" /></li>';
		html +='<li><a rel="font"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/font.png" alt="' + this.lang_vars.bb_font + '" title="' + this.lang_vars.bb_font + '" /></a></li>';
		html +='<li><a rel="color"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/color.png" alt="' + this.lang_vars.bb_color + '" title="' + this.lang_vars.bb_color + '" /></a></li>';
		
		$('#editorIcons').html(html);
		$('#editorSmileys').html('<li><a rel="smileys"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/smile.png" alt="' + this.lang_vars.sm_list + '" title="' + this.lang_vars.sm_list + '" /></li></a>');
		
		html = '<li><a rel="font60">' + this.lang_vars.font_60 + '</a></li>';
		html += '<li><a rel="font80">' + this.lang_vars.font_80 + '</a><br /></li>';
		html += '<li><a rel="font100">' + this.lang_vars.font_100 + '</a><br /></li>';
		html += '<li><a rel="font120">' + this.lang_vars.font_120 + '</a><br /></li>';
		html += '<li><a rel="font140">' + this.lang_vars.font_140 + '</a></li>';
		
		$('#editorFont').html(html);
		
		html  = '<a rel="color-450501"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/450501.png" /></a>';
		html += '<a rel="color-ab7877"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/ab7877.png" /></a>';
		html += '<a rel="color-fea7a5"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/fea7a5.png" /></a>';
		html += '<a rel="color-fa778a"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/fa778a.png" /></a>';
		html += '<a rel="color-ff4b00"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/ff4b00.png" /></a>';
		html += '<a rel="color-ff0a00"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/ff0a00.png" /></a>';
		html += '<a rel="color-a51500"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/a51500.png" /></a>';
		
		html += '<a rel="color-df7e00"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/df7e00.png" /></a>';
		html += '<a rel="color-fab600"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/fab600.png" /></a>';
		html += '<a rel="color-cfb000"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/cfb000.png" /></a>';
		html += '<a rel="color-fffa05"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/fffa05.png" /></a>';
		html += '<a rel="color-fbd532"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/fbd532.png" /></a>';
		html += '<a rel="color-494700"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/494700.png" /></a>';
		html += '<a rel="color-3e7506"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/3e7506.png" /></a>';
		
		html += '<a rel="color-7dd100"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/7dd100.png" /></a>';
		html += '<a rel="color-71f93c"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/71f93c.png" /></a>';
		html += '<a rel="color-38d200"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/38d200.png" /></a>';
		html += '<a rel="color-007645"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/007645.png" /></a>';
		html += '<a rel="color-3cd2a5"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/3cd2a5.png" /></a>';
		html += '<a rel="color-00fadb"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/00fadb.png" /></a>';
		html += '<a rel="color-00746e"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/00746e.png" /></a>';
		
		html += '<a rel="color-74d6ff"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/74d6ff.png" /></a>';
		html += '<a rel="color-007cac"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/007cac.png" /></a>';
		html += '<a rel="color-00407b"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/00407b.png" /></a>';
		html += '<a rel="color-4382d7"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/4382d7.png" /></a>';
		html += '<a rel="color-46437e"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/46437e.png" /></a>';
		html += '<a rel="color-d83bf5"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/d83bf5.png" /></a>';
		html += '<a rel="color-ff3280"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/ff3280.png" /></a>';
		
		html += '<a rel="color-000000"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/000000.png" /></a>';
		html += '<a rel="color-555454"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/555454.png" /></a>';
		html += '<a rel="color-7b7b7b"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/7b7b7b.png" /></a>';
		html += '<a rel="color-a0a0a0"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/a0a0a0.png" /></a>';
		html += '<a rel="color-bdbdbd"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/bdbdbd.png" /></a>';
		html += '<a rel="color-d1d1d1"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/d1d1d1.png" /></a>';
		html += '<a rel="color-ffffff"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/ffffff.png" /></a>';
		
		$('#editorColors').html(html);
		
		html  = '<a rel="smile"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/smile.png" alt="' + this.lang_vars.sm_smile + '" title="' + this.lang_vars.sm_smile + '" /></a>';
		html += '<a rel="grin"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/grin.png" alt="' + this.lang_vars.sm_grin + '" title="' + this.lang_vars.sm_grin + '" /></a>';
		html += '<a rel="sad"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/sad.png" alt="' + this.lang_vars.sm_sad + '" title="' + this.lang_vars.sm_sad + '" /></a>';
		html += '<a rel="wink"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/wink.png" alt="' + this.lang_vars.sm_wink + '" title="' + this.lang_vars.sm_wink + '" /></a>';
		html += '<a rel="confused"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/confused.png" alt="' + this.lang_vars.sm_confused + '" title="' + this.lang_vars.sm_confused + '" /></a>';
		html += '<a rel="tongue"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/tongue.png" alt="' + this.lang_vars.sm_tongue + '" title="' + this.lang_vars.sm_tongue + '" /></a>';
		html += '<a rel="shy"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/shy.png" alt="' + this.lang_vars.sm_shy + '" title="' + this.lang_vars.sm_shy + '" /></a>';
		html += '<a rel="angry"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/angry.png" alt="' + this.lang_vars.sm_angry + '" title="' + this.lang_vars.sm_angry + '" /></a>';
		html += '<a rel="dislike"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/dislike.png" alt="' + this.lang_vars.sm_dislike + '" title="' + this.lang_vars.sm_dislike + '" /></a>';
		html += '<a rel="boss"><img src="' + this.config.path + '/skins/' + this.config.skin + '/images/icons/boss.png" alt="' + this.lang_vars.sm_boss + '" title="' + this.lang_vars.sm_boss + '" /></a>';
		
		$('#smileys-popup').html(html);
	}
}