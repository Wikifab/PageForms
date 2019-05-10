<?php
/**
 * @author Yaron Koren
 * @file
 * @ingroup PF
 */

/**
 * Represents the "free text" in a wiki page, i.e. the text not in
 * pre-defined template calls and sections.
 */
class PFWikiPageFreeText {
	private $mText;
	private $mOptions;

	function __construct( $options = [] ) {
		$this->mOptions = $options;
	}

	function setText( &$text, $form_submitted = FALSE ) {

		if ( $this->isTranslateEnabled() && isset($this->mOptions['translatable']) && $this->mOptions['translatable']) {

			if (!$form_submitted) {
				// remove translate tags when displaying the form as it messes up with VE
				if(preg_match('#^<translate>([\S\s]*)<\/translate>$#m', $text, $matches)) {
					$text = $matches[1];
				}
			} else {
				// fix : rearrange <!--T:<number>--> tags to avoid errors
				// 4 cases : 
				//		1 : text<tag> => text\n\n<tag>
				//		2 : <tag>text => <tag>\ntext
				//		3 : <tag>\n* => <tag>\n\n
				//		4 : \n*<tag> => \n\n<tag>
				$text = preg_replace(['#([^\s])(<!--T:\d+-->)#m', '#(<!--T:\d+-->)([^\s])#m', '#(<!--T:\d+-->)([\s]+)#m', '#([\s]+)(<!--T:\d+-->)#m'], ["$1\n\n$2", "$1\n$2", "$1\n", "\n\n$2"], $text);

				// put translate tags back
				$text = '<translate>' . $text .'</translate>';
			}
		}

		$this->mText = $text;
	}

	function isTranslateEnabled() {
		return class_exists('SpecialTranslate');
	}

	function getText() {
		return $this->mText;
	}

	function getOptions() {
		return $this->mOptions;
	}

	function setOptions( $options ) {
		$this->mOptions = $options;
	}
}