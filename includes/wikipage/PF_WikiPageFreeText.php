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
				if(preg_match('#^<noinclude><translate><\/noinclude>([\S\s]*)<noinclude><\/translate><\/noinclude>$#m', $text, $matches)) {
					$text = $matches[1];
				}
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

				$regexs = [];
				$replacements = [];
				//	1 : text<tag> => text\n\n<tag>
				$regexs [] = '#([^\s=])([ \t]*)(<!--T:\d+-->)#m';
				$replacements[] = "$1\n\n$3";
				//	2 : <tag>text => <tag>\ntext
				$regexs [] = '#(<!--T:\d+-->)([^\s])#m';
				$replacements[] = "$1\n$2";
				//	3 : <tag>\n* => <tag>\n\n
				$regexs [] = '#(<!--T:\d+-->)([\s]+)#m';
				$replacements[] = "$1\n";
				//	4 : \n*<tag> => \n\n<tag>
				//$regexs [] = '#([\s]+)(<!--T:\d+-->)#m';
				//$replacements[] = "\n\n$2";
				$text = preg_replace($regexs, $replacements, $text);

				// put translate tags back
				$text = '<noinclude><translate></noinclude>' . $text .'<noinclude></translate></noinclude>';
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