#Simplium Editor

A simple Javascript BB Code Editor (wysiwym) that focues on being lightweight, customizable and good looking. It was created for an abandoned open source bulletin board project as the default editor.

![Simplium Editor](http://feniksi.com/wp-content/uploads/2011/09/editori1.jpg)

It uses jQuery and [RangyInputs](http://code.google.com/p/rangyinputs/wiki/Documentation "Rangy Inputs jQuery Plugin") to do it's work. Icons are from the popular [FamFamFam Silk](http://www.famfamfam.com/lab/icons/silk/ "FamFamFam Silk Icons") collection, while the lovely smileys are custom made by [Gezim Osmani](http://artisticca.com/ "Artisticca Creative Agency").

Features
--------

It's a lightweight editor with only about 450 lines of commented Javascript code. Breaking down what it has to offer, I'd sum up the following points:

+ Nice and clean user interface
+ BB Codes for the most common operations (Bold, Italic, Underline, Links, etc)
+ Smileys
+ Shortcuts with a combination of CTRL (Win) or CMD (Mac) and B (Bold), I (Italic), U (Underline), L (Link)
+ Vertically resizable using CSS3 "resize: vertically"
+ Skinable via a simple CSS and images. Can support multiple skins
+ Localizable with really simple JSON formatted Javascript files
+ Compatible with IE6 (no CSS3, no PNG alpha), IE7 and IE8 (no border-radius), IE9 (no resize:vertically), Chrome, Safari, Firefox and Opera

Installation
-----------

It's quite simple really. The default setup will create a 600px wide editor with the default skin and language. It can be easily customized as I'll show shortly.

First include the CSS of the skin you're using. I'll assume the default:
	<div>
		<ul class="block-list">
			<li>Clicking this block will take you to <a href="http://davidwalsh.name">DavidWalsh.name</a></li>
			<li>Clicking this block will take you to <a href="http://scriptandstyle.com">Script&Style.com</a>.</li>
			<li>Clicking this block will take you to <a href="http://mootools.net">MooTools.net</a></li>
		</ul>
	</div>
	
Next include jQuery and editor.js:
	<script type="text/javascript" src="editor/jquery/jquery.js"></script>
	<script type="text/javascript" src="editor/editor.js"></script>
	
Create a textarea with a name and a class of "editor" (it can be overriden):
	<textarea name="permbajtja" class="editori"></textarea>
	
Finally initialize the editor:
	<script type="text/javascript">	
	$(document).ready(function(){	
		Editor.loadEditor();
	});
	</script>
	
If you feel you want to override the initialization parameters, here they are:
	Editor.loadEditor({
		selector: '.my_editor', // the selector (id or class) of the textarea that will be converted
		skin: 'skin_name', // the skin that will be used. The actual files should exist under the "skins" folder
		width: 700, // editor width
		lang: 'en', // language. An actual file should exist with the appropriate name (en => en.js, de => de.js)
		path: 'editori', // the folder where the editor files are. No slashes (/).
	});