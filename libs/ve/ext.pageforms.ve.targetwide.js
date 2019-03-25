( function ( mw, OO, ve ) {
	'use strict';
	mw.pageForms = mw.pageForms || {};
	mw.pageForms.ve = mw.pageForms.ve || {
		ui: {}
	};

	/**
	 * PageForms-specific target, inheriting from the stand-alone target
	 *
	 * @class
	 * @extends ve.init.sa.Target
	 */
	mw.pageForms.ve.Targetwide = function PageFormsVeTargetwide(node, content) {


		mw.pageForms.ve.Targetwide.parent.call( this, node, content );
	};

	OO.inheritClass( mw.pageForms.ve.Targetwide, mw.pageForms.ve.Target );

	mw.pageForms.ve.Targetwide.static.name = 'pageFormsWide';

	mw.pageForms.ve.Targetwide.static.toolbarGroups = [
		// History
		//{ include: [ 'undo', 'redo' ] },
		// Format
		{
			header: OO.ui.deferMsg( 'visualeditor-toolbar-paragraph-format' ),
			title: OO.ui.deferMsg( 'visualeditor-toolbar-format-tooltip' ),
			type: 'menu',
			include: [ { group: 'format' } ],
			promote: [ 'paragraph' ],
			demote: [ 'preformatted', 'blockquote' ]
		},
		// Text style
		{
			header: OO.ui.deferMsg( 'visualeditor-toolbar-text-style' ),
			title: OO.ui.deferMsg( 'visualeditor-toolbar-style-tooltip' ),
			include: [ 'bold', 'italic', 'moreTextStyle' ]
		},
		// Link
		{ include: [ 'link' ] },
		// Structure
		{
			header: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
			title: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
			type: 'list',
			icon: 'listBullet',
			include: [ { group: 'structure' } ],
			demote: [ 'outdent', 'indent' ]
		},
		// Insert
		{
			header: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
			title: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
			type: 'list',
			icon: 'add',
			label: '',
			include: [ 'mediapmg', 'insertTable', 'specialCharacter', 'warningblock','preformatted','infoblock', 'ideablock', 'dontblock', 'pinblock', 'iatemplateblock']
		},
		// Special character toolbar
		//{ include: [ 'specialCharacter' ] }
	];

	ve.init.mw.targetFactory.register( mw.pageForms.ve.Targetwide );

}( mediaWiki, OO, ve ) );
