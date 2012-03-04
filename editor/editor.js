/*
	Editor permbajtje ne Javascript duke perdorur jQuery.
	
	@autori		Fadion Dashi
	@licenca	GPL
*/

var Editor = {
	selector: '.editor', //Tipi i selektorit qe krijon Editore.
	skin: 'simplium', //Pamja qe do te perdoret. Duhet te kete skedar perkates ne direktorine "skins"
	width: 600, //Gjeresia e pergjithshme e Editorit (me pak se 600 prish pozicionimin e ikonave).
	lang: 'al', //Gjuha. Duhet te kete skedar perkates (xx.js) ne direktorine "lang".
	path: 'editor', //Direktoria ku editori ndodhet relative me dokumentin ku perdoret. Pa slashe (/) ne fillim dhe ne fund.
	
	lang_vars: {}, /* Do te mbaje variablat e gjuhes. */
	
	/*
		Nis Editorin
	*/
	loadEditor: function(init){
		/*
			Nese s'ka parametra nisjeje, vendosi "undefined" per kontroll te lehte.
		*/
		if (typeof init == 'undefined') { init = { selector: undefined, skin: undefined, width: undefined, lang: undefined, path: undefined } }
		
		/*
			Kontrollo permbajtjen e parametrave te nisjes dhe kaloja variablave globale.
		*/
		if (typeof init.selector != 'undefined') { Editor.selector = init.selector; }
		if (typeof init.skin != 'undefined') { Editor.skin = init.skin; }
		if (typeof init.width != 'undefined') { Editor.width = init.width; }
		if (typeof init.path != 'undefined') { Editor.path = init.path; }
		if (typeof init.lang != 'undefined') { Editor.lang = init.lang; }
		
		if ($(Editor.selector).length) {
			/*
				Perfshi pluginin permes jQuery.
			*/
			$.getScript(Editor.path + '/jquery/rangyinputs.jquery.js');
			
			/*
				Bej nje therritje AJAX per te ngarkuar skedarin e gjuhes ne menyre asinkrone.
			*/
			$.ajax({
				url: Editor.path + '/lang/' + Editor.lang + '.js',
				dataType: 'json',
				async: false,
				success: function(data){
					Editor.lang_vars = data;
				},
				error: function() {
					alert('Gjuha nuk u ngarkua');	
				}
			});
			
			/*
				Krijo Editorin.
			*/
			Editor.createHTML();
			Editor.createIcons();
			Editor.catchEvents();
			
		}
	},
	
	/*
		Kap ngjarje te ndryshe: klikime ikonash, menute dhe shkurtimet e tastjeres.
	*/
	catchEvents: function(){
		/*
			Funksionaliteti i menuve.
		*/
		$('#editorIcons a, #editorSmileys a').click(function(){
			/*
				Ikonat njihen nga atributi "rel".
			*/
			icon = $(this).attr('rel');
			icon_long = '';
			/*
				Percakto selektorin ne baze te tipit te ikones.
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
				Nese eshte nje nga ikonat me menu.
			*/
			if (icon_long != '') {
				/*
					Hap menune. Pozicioni i te gjitha menuve llogaritet relativisht me
					pozicionin e ikonave perkatese.
				*/
				$(icon_long).css({
					'top': $(this).position().top + 25,
					'left': $(this).position().left - $(icon_long).width()/2
				}).fadeIn(300);
				
				/*
					Fshih cdo menu tjeter (potencialisht te hapur).
				*/
				$('#editorColors, #smileys-popup, #editorFont').not(icon_long).fadeOut(300);
				return false;
			}
			
			/*
				Nese erdhi ketu, klikimi ishte mbi nje ikone normale qe nuk hap menu.
				Gjej kodinBB qe i perket asaj ikone.
			*/
			Editor.findBBCode(icon);
		});
		
		/*
			Gjej kodinBB te ikonave qe gjenden ne menu.
		*/
		$('#editorFont li a, #editorColors a').click(function(){
			Editor.findBBCode($(this).attr('rel'));
		});
		
		/*
			Gjej Qeshjen e ikonave qe gjendet ne menu.
		*/
		$('#smileys-popup a').click(function(){
			Editor.findSmiley($(this).attr('rel'));
		});
		
		/*
			Zhduki menute nese klikohet kudo ne dokument.
		*/
		$(document).click(function(){
			$('#editorFont, #editorColors, #smileys-popup').fadeOut('slow');
		});
		
		/*
			Shkurtimet e ndryshme te tastjeres. Kontrollo nese po mbahet shtypur butoni
			CTRL (ctrlKey) ose CMD ne Mac (metaKey) per te aktivizuar shkurtimet. Me pas,
			kontrollo nese krahas CTRL/CMD po shtypet B (bold), I (italic), U (underline)
			apo L (url). Ne fund, shto kodinBB. 
		*/
		$(document).keydown(function(e){
			if (e.ctrlKey || e.metaKey) {
				if (e.keyCode == 66) {
					Editor.addBBCode('[b]', '[/b]');
				}
				if (e.keyCode == 73) {
					Editor.addBBCode('[i]', '[/i]');
				}
				if (e.keyCode == 85) {
					Editor.addBBCode('[u]', '[/u]');
				}
				if (e.keyCode == 76) {
					Editor.addBBCode('[url=]', '[/url]');
				}
			}
		});
	},
	
	/*
		Gjej kodinBB ne baze te ikones se shtypur.
		Parametri "icon" eshte emri i ikones (bold, italic, etj).
	*/
	findBBCode: function(icon){
		/*
			Nese tipi eshte ngjyre, perpunoje. Atributi "rel" per ngjyrat eshte
			i formatit "color-ff0000" per ti identifikuar. Heq pjesen "color-"
			dhe shton kodinBB per ngjyren perkatese.
		*/
		if (icon.indexOf('color') != -1) {
			icon = icon.replace('color-', '');
			Editor.addBBCode('[color=' + icon + ']', '[/color]');
			return false;
		}
		
		/*
			Kontrollo nese ikona eshte e tipeve te percaktuara dhe shto kodinBB te duhur.
		*/
		switch (icon) {
			case 'bold':
				Editor.addBBCode('[b]', '[/b]');
				break;
			case 'italic':
				Editor.addBBCode('[i]', '[/i]');
				break;
			case 'underline':
				Editor.addBBCode('[u]', '[/u]');
				break;
			case 'strikethrough':
				Editor.addBBCode('[s]', '[/s]');
				break;
			case 'bullets':
				Editor.addBBCode('[list]\n[*]', '\n[/list]');
				break;
			case 'numbers':
				Editor.addBBCode('[list=1]\n[*]', '\n[/list]');
				break;
			case 'list_item':
				Editor.addBBCode('[*]', '');
				break;
			case 'link':
				Editor.addBBCode('[url=]', '[/url]');
				break;
			case 'picture':
				Editor.addBBCode('[img]', '[/img]');
				break;
			case 'video':
				Editor.addBBCode('[youtube]', '[/youtube]');
				break;
			case 'quote':
				Editor.addBBCode('[quote]', '[/quote]');
				break;
			case 'code':
				Editor.addBBCode('[code]', '[/code]');
				break;
			case 'font60':
				Editor.addBBCode('[font=60]', '[/font]');
				break;
			case 'font80':
				Editor.addBBCode('[font=80]', '[/font]');
				break;
			case 'font100':
				Editor.addBBCode('[font=100]', '[/font]');
				break;
			case 'font120':
				Editor.addBBCode('[font=120]', '[/font]');
				break;
			case 'font140':
				Editor.addBBCode('[font=140]', '[/font]');
				break;
		}
	},
	
	/*
		Shto kodinBB.
		Parametri "bb_start" eshte kodiBB nises (psh: [b]).
		Parametri "bb_end" eshte kodiBB mbylles (psh: [/b]).
	*/
	addBBCode: function(bb_start, bb_end){
		textarea = $('#editorWrapper textarea');
		textarea.focus(); /* Rregullim per IE */
		
		/*
			Merr pozicionin fillestar dhe perfundimtar te selektimit.
			Funksion i Javascript, por i rishkruar nga plugini "rangyinputs"
		*/
		range = textarea.getSelection();
		
		/*
			range.start == range.end kur nuk ka asgje te selektuar.
			Fut kodinBB ne pozicionin e kursorit dhe zhvendose kursorin
			aq karaktere larg sa gjatesia e bb_end. insertText() dhe
			setSelection() jane funksione te "rangyinputs".
		*/
		if (range.start == range.end) {
			textarea.insertText(bb_start + bb_end, range.start);
			textarea.setSelection(range.start + bb_start.length);
		} else {
			/*
				Ndodh kur ka selektim teksti. Ate tekst te selektuar
				rrethoje me kodinBB. surroundSelectedText() eshte
				funksion i "rangyinputs".
			*/
			textarea.surroundSelectedText(bb_start, bb_end);
		}
		
		textarea.focus(); /* Rregullim per Firefox */
		
	},
	
	/*
		Gjej Qeshjen ne baze te ikones se shtypur.
		Parametri "smiley" eshte emri i ikones: smile, sad, wink, etj.
	*/
	findSmiley: function(smiley){
		switch (smiley) {
			case 'smile':
				Editor.addSmiley(':)');
				break;
			case 'grin':
				Editor.addSmiley(':D');
				break;
			case 'sad':
				Editor.addSmiley(':(');
				break;
			case 'wink':
				Editor.addSmiley(';)');
				break;
			case 'confused':
				Editor.addSmiley(':o');
				break;
			case 'tongue':
				Editor.addSmiley(':P');
				break;
			case 'shy':
				Editor.addSmiley(':$');
				break;
			case 'angry':
				Editor.addSmiley(':@');
				break;
			case 'dislike':
				Editor.addSmiley(':S');
				break;
			case 'boss':
				Editor.addSmiley('$-)');
				break;
		}
	},
	
	/*
		Shto Qeshjen.
		Parametri "code" eshte tipi i Qeshjes: :), :D, etj.
	*/
	addSmiley: function(code){
		textarea = $('#editorWrapper textarea');
		textarea.focus(); /* Rregullim per IE */
		range = textarea.getSelection();

		if (range.start == range.end) {
			/*
				Fut Qeshjen ne pozicionin e kursorit dhe e zhvendos ate
				aq karaktere sa Qeshja ka.
			*/
			textarea.insertText(code, range.start, true);
		} else {
			/*
				Zevendeso tekstin e zgjedhur me Qeshjen. replaceSelectedText()
				eshte funksion i "rangyinputs".
			*/
			textarea.replaceSelectedText(code);
		}
		
		textarea.focus(); /* Rregullim per Firefox */
	},
	
	/*
		Krijo strukturen HTML permes funksioneve te jQuery.
	*/
	createHTML: function(){
		/*
			Merr vleren e atributit "name" per tja ngjitur editorit.
		*/
		textarea_name = $(Editor.selector).attr('name');
		
		$(Editor.selector).replaceWith('<div id="editorWrapper" style="width:' + Editor.width + 'px"></div>');
		$('#editorWrapper').html('<div id="editorToolbar"><ul id="editorIcons"></ul><ul id="editorSmileys"></ul></div><textarea></textarea><div id="editorShadow"><div id="shadow-left"></div><div id="shadow-middle"></div><div id="shadow-right"></div></div><ul id="editorFont"></ul><div id="editorColors"></div><div id="smileys-popup"></div>');
		
		/*
			Fshih menute.
		*/
		$('#editorFont, #editorColors, #smileys-popup').hide();
		/*
			Ne strukturen HTML, hija eshte ndare ne 3 elemente (majtas, qender dhe djathtas).
			Llogarit gjeresine e hijes se mesit ne baze te gjeresise se Editorit dhe hijeve
			majtas dhe djathtas. Kjo e ben hijen te jete uniforme, pavaresisht gjeresise se
			editorit te percaktuar ne Editor.width.
		*/
		$('#shadow-middle').css('width', Editor.width - ($('#shadow-left').width() + $('#shadow-right').width()) + 'px');
		$('#editorWrapper').find('textarea').attr('name', textarea_name);
	},
	
	/*
		Krijo kodin HTML te ikonave.
	*/
	createIcons: function(){
		html = '';
		
		html  = '<li><a rel="bold"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/bold.png" alt="' + Editor.lang_vars.bb_bold + '" title="' + Editor.lang_vars.bb_bold + '" /></a></li>';
		html += '<li><a rel="italic"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/italic.png" alt="' + Editor.lang_vars.bb_italic + '" title="' + Editor.lang_vars.bb_italic + '" /></a></li>';
		html +='<li><a rel="underline"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/underline.png" alt="' + Editor.lang_vars.bb_underline + '" title="' + Editor.lang_vars.bb_underline + '" /></a></li>';
		html +='<li><a rel="strikethrough"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/strikethrough.png" alt="' + Editor.lang_vars.bb_strikethrough + '" title="' + Editor.lang_vars.bb_strikethrough + '" /></a></li>';
		html +='<li><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/seperator.png" alt="' + Editor.lang_vars.seperator + '" /></li>';
		html +='<li><a rel="bullets"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/bullets.png" alt="' + Editor.lang_vars.bb_bullets + '" title="' + Editor.lang_vars.bb_bullets + '" /></a></li>';
		html +='<li><a rel="numbers"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/numbers.png" alt="' + Editor.lang_vars.bb_numbers + '" title="' + Editor.lang_vars.bb_numbers + '" /></a></li>';
		html +='<li><a rel="list_item"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/list_item.png" alt="' + Editor.lang_vars.bb_item + '" title="' + Editor.lang_vars.bb_item + '" /></a></li>';
		html +='<li><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/seperator.png" alt="' + Editor.lang_vars.seperator + '" /></li>';
		html +='<li><a rel="link"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/link.png" alt="' + Editor.lang_vars.bb_link + '" title="' + Editor.lang_vars.bb_link + '" /></a></li>';
		html +='<li><a rel="picture"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/picture.png" alt="' + Editor.lang_vars.bb_picture + '" title="' + Editor.lang_vars.bb_picture + '" /></a></li>';
		html +='<li><a rel="video"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/video.png" alt="' + Editor.lang_vars.bb_video + '" title="' + Editor.lang_vars.bb_video + '" /></a></li>';
		html +='<li><a rel="quote"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/quote.png" alt="' + Editor.lang_vars.bb_quote + '" title="' + Editor.lang_vars.bb_quote + '" /></a></li>';
		html +='<li><a rel="code"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/code.png" alt="' + Editor.lang_vars.bb_code + '" title="' + Editor.lang_vars.bb_code + '" /></a></li>';
		html +='<li><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/seperator.png" alt="' + Editor.lang_vars.seperator + '" /></li>';
		html +='<li><a rel="font"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/font.png" alt="' + Editor.lang_vars.bb_font + '" title="' + Editor.lang_vars.bb_font + '" /></a></li>';
		html +='<li><a rel="color"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/color.png" alt="' + Editor.lang_vars.bb_color + '" title="' + Editor.lang_vars.bb_color + '" /></a></li>';
		
		$('#editorIcons').html(html);
		$('#editorSmileys').html('<li><a rel="smileys"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/smile.png" alt="' + Editor.lang_vars.sm_list + '" title="' + Editor.lang_vars.sm_list + '" /></li></a>');
		
		html = '<li><a rel="font60">' + Editor.lang_vars.font_60 + '</a></li>';
		html += '<li><a rel="font80">' + Editor.lang_vars.font_80 + '</a><br /></li>';
		html += '<li><a rel="font100">' + Editor.lang_vars.font_100 + '</a><br /></li>';
		html += '<li><a rel="font120">' + Editor.lang_vars.font_120 + '</a><br /></li>';
		html += '<li><a rel="font140">' + Editor.lang_vars.font_140 + '</a></li>';
		
		$('#editorFont').html(html);
		
		html  = '<a rel="color-450501"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/450501.png" /></a>';
		html += '<a rel="color-ab7877"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/ab7877.png" /></a>';
		html += '<a rel="color-fea7a5"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/fea7a5.png" /></a>';
		html += '<a rel="color-fa778a"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/fa778a.png" /></a>';
		html += '<a rel="color-ff4b00"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/ff4b00.png" /></a>';
		html += '<a rel="color-ff0a00"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/ff0a00.png" /></a>';
		html += '<a rel="color-a51500"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/a51500.png" /></a>';
		
		html += '<a rel="color-df7e00"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/df7e00.png" /></a>';
		html += '<a rel="color-fab600"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/fab600.png" /></a>';
		html += '<a rel="color-cfb000"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/cfb000.png" /></a>';
		html += '<a rel="color-fffa05"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/fffa05.png" /></a>';
		html += '<a rel="color-fbd532"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/fbd532.png" /></a>';
		html += '<a rel="color-494700"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/494700.png" /></a>';
		html += '<a rel="color-3e7506"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/3e7506.png" /></a>';
		
		html += '<a rel="color-7dd100"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/7dd100.png" /></a>';
		html += '<a rel="color-71f93c"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/71f93c.png" /></a>';
		html += '<a rel="color-38d200"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/38d200.png" /></a>';
		html += '<a rel="color-007645"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/007645.png" /></a>';
		html += '<a rel="color-3cd2a5"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/3cd2a5.png" /></a>';
		html += '<a rel="color-00fadb"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/00fadb.png" /></a>';
		html += '<a rel="color-00746e"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/00746e.png" /></a>';
		
		html += '<a rel="color-74d6ff"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/74d6ff.png" /></a>';
		html += '<a rel="color-007cac"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/007cac.png" /></a>';
		html += '<a rel="color-00407b"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/00407b.png" /></a>';
		html += '<a rel="color-4382d7"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/4382d7.png" /></a>';
		html += '<a rel="color-46437e"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/46437e.png" /></a>';
		html += '<a rel="color-d83bf5"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/d83bf5.png" /></a>';
		html += '<a rel="color-ff3280"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/ff3280.png" /></a>';
		
		html += '<a rel="color-000000"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/000000.png" /></a>';
		html += '<a rel="color-555454"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/555454.png" /></a>';
		html += '<a rel="color-7b7b7b"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/7b7b7b.png" /></a>';
		html += '<a rel="color-a0a0a0"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/a0a0a0.png" /></a>';
		html += '<a rel="color-bdbdbd"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/bdbdbd.png" /></a>';
		html += '<a rel="color-d1d1d1"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/d1d1d1.png" /></a>';
		html += '<a rel="color-ffffff"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/ffffff.png" /></a>';
		
		$('#editorColors').html(html);
		
		html  = '<a rel="smile"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/smile.png" alt="' + Editor.lang_vars.sm_smile + '" title="' + Editor.lang_vars.sm_smile + '" /></a>';
		html += '<a rel="grin"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/grin.png" alt="' + Editor.lang_vars.sm_grin + '" title="' + Editor.lang_vars.sm_grin + '" /></a>';
		html += '<a rel="sad"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/sad.png" alt="' + Editor.lang_vars.sm_sad + '" title="' + Editor.lang_vars.sm_sad + '" /></a>';
		html += '<a rel="wink"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/wink.png" alt="' + Editor.lang_vars.sm_wink + '" title="' + Editor.lang_vars.sm_wink + '" /></a>';
		html += '<a rel="confused"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/confused.png" alt="' + Editor.lang_vars.sm_confused + '" title="' + Editor.lang_vars.sm_confused + '" /></a>';
		html += '<a rel="tongue"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/tongue.png" alt="' + Editor.lang_vars.sm_tongue + '" title="' + Editor.lang_vars.sm_tongue + '" /></a>';
		html += '<a rel="shy"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/shy.png" alt="' + Editor.lang_vars.sm_shy + '" title="' + Editor.lang_vars.sm_shy + '" /></a>';
		html += '<a rel="angry"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/angry.png" alt="' + Editor.lang_vars.sm_angry + '" title="' + Editor.lang_vars.sm_angry + '" /></a>';
		html += '<a rel="dislike"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/dislike.png" alt="' + Editor.lang_vars.sm_dislike + '" title="' + Editor.lang_vars.sm_dislike + '" /></a>';
		html += '<a rel="boss"><img src="' + Editor.path + '/skins/' + Editor.skin + '/images/icons/boss.png" alt="' + Editor.lang_vars.sm_boss + '" title="' + Editor.lang_vars.sm_boss + '" /></a>';
		
		$('#smileys-popup').html(html);
	}
}