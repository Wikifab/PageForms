<?php
/**
 * @author Yaron Koren
 * @file
 * @ingroup PF
 */

/**
 * Represents the structured contents of a wiki page.
 */
class PFWikiPage {
	private $mComponents = array();
	private $mEmbeddedTemplateDefs = array();
	private $mEmbeddedTemplateCalls = array();
	private $mFreeTextOnlyInclude = false;

	function addTemplate( $templateInForm ) {
		$templateName = $templateInForm->getTemplateName();
		$this->mComponents[] = new PFWikiPageTemplate( $templateName, !$templateInForm->allowsMultiple() );
		if ( $templateInForm->getInstanceNum() == 0 ) {
			$embedInTemplate = $templateInForm->getEmbedInTemplate();
			$embedInParam = $templateInForm->getEmbedInField();
			if ( $embedInTemplate != null && $embedInParam != null ) {
				$this->mEmbeddedTemplateDefs[] = array( $embedInTemplate, $embedInParam, $templateName );
			}
		}
	}

	function addTemplateParam( $templateName, $instanceNum, $paramName, $value, $options = [] ) {
		$curInstance = 0;
		foreach ( $this->mComponents as $i => $component ) {
			if ( get_class( $component ) == 'PFWikiPageTemplate' && $component->getName() == $templateName ) {
				if ( $curInstance++ == $instanceNum ) {
					$this->mComponents[$i]->addParam( $paramName, $value, $options );
					return;
				}
			}
		}
	}

	function getEmbeddedTemplateForParam( $templateName, $paramName ) {
		foreach ( $this->mEmbeddedTemplateDefs as $etd ) {
			if ( $etd[0] == $templateName && $etd[1] == $paramName ) {
				return $etd[2];
			}
		}
		return null;
	}

	function addSection( $sectionName, $headerLevel, $sectionText, $sectionOptions ) {
		$this->mComponents[] = new PFWikiPageSection( $sectionName, $headerLevel, $sectionText, $sectionOptions );
	}

	function addFreeTextSection($options = []) {
		$this->mComponents[] = new PFWikiPageFreeText($options);
	}

	function setFreeText( &$text, $form_submitted = FALSE ) {
		foreach ( $this->mComponents as $i => $component ) {
			if ( get_class( $component ) == 'PFWikiPageFreeText' ) {
				// call to PFWikiPageFreeText->setText()
				// we pass $text by reference, so that translate tags get removed for displaying and put back
				// when submitting the form
				$this->mComponents[$i]->setText( $text, $form_submitted );
				return;
			}
		}
		// Throw an exception here if no free text section found?
	}

	function makeFreeTextOnlyInclude() {
		$this->mFreeTextOnlyInclude = true;
	}

	function freeTextOnlyInclude() {
		return $this->mFreeTextOnlyInclude;
	}

	/**
	 * Create an array of the template calls in the page that are embedded
	 * in other templates.
	 */
	private function findEmbeddedTemplates() {
		foreach ( $this->mEmbeddedTemplateDefs as $etd ) {
			$embeddedTemplateName = $etd[2];
			foreach ( $this->mComponents as $component ) {
				if ( get_class( $component ) == 'PFWikiPageTemplate' ) {
					if ( $embeddedTemplateName == $component->getName() ) {
						if ( !array_key_exists( $embeddedTemplateName, $this->mEmbeddedTemplateCalls ) ) {
							$this->mEmbeddedTemplateCalls[$embeddedTemplateName] = array();
						}
						$this->mEmbeddedTemplateCalls[$embeddedTemplateName][] = $component;
					}
				}
			}
		}
	}

	function createTemplateCall( $template ) {
		global $wgPageFormsUseTranslatableTemplates;
		$lastNumericParam = 0;
		$template->addUnhandledParams();

		if ($wgPageFormsUseTranslatableTemplates && $template->getName()) {
			$templateCall = '{{ {{tntn|' . $template->getName() . '}}';
		} else {
			$templateCall = '{{' . $template->getName();
		}
		foreach ( $template->getParams() as $templateParam ) {
			$paramName = $templateParam->getName();
			$embeddedTemplateName = $this->getEmbeddedTemplateForParam( $template->getName(), $paramName );
			$paramValue = $templateParam->getValue();

			// If there's no value, skip this param.
			if ( $embeddedTemplateName == '' && $paramValue == '' ) {
				continue;
			}
			// Include the field name only for non-numeric field names.
			if ( is_numeric( $paramName ) ) {
				// Add at least one pipe, but possibly more -
				// one each for any numeric param in between
				// that wasn't submitted.
				while ( $lastNumericParam < $paramName ) {
					$templateCall .= '|';
					$lastNumericParam++;
				}
			} else {
				$templateCall .= "\n|$paramName=";
			}
			if ( $embeddedTemplateName != '' ) {
				foreach ( $this->mEmbeddedTemplateCalls[$embeddedTemplateName] as $embeddedTemplate ) {
					$templateCall .= $this->createTemplateCall( $embeddedTemplate );
				}
			} else {
				$templateCall .= $paramValue;
			}
		}
		// For mostly aesthetic purposes, if the template call ends with
		// a bunch of pipes (i.e., it's an indexed template with unused
		// parameters at the end), remove the pipes.
		$templateCall = preg_replace( '/\|*$/', '', $templateCall );

		// Add another newline before the final bracket, if this
		// template call is already more than one line
		if ( strpos( $templateCall, "\n" ) ) {
			$templateCall .= "\n";
		}
		$templateCall .= "}}";
		return $templateCall;
	}

	function createTemplateCallsForTemplateName( $templateName ) {
		$text = '';
		foreach ( $this->mComponents as $component ) {
			if ( get_class( $component ) == 'PFWikiPageTemplate' ) {
				if ( $component->getName() == $templateName ) {
					$text .= $this->createTemplateCall( $component ) . "\n";
				}
			}
		}
		return $text;
	}

	function createPageText() {
		// First, go through and store the templates that are embedded,
		// so that they can have special printing.
		$this->findEmbeddedTemplates();

		// Now create the text.
		$pageText = '';
		foreach ( $this->mComponents as $component ) {
			if ( get_class( $component ) == 'PFWikiPageTemplate' ) {
				if ( !array_key_exists( $component->getName(), $this->mEmbeddedTemplateCalls ) ) {
					$pageText .= $this->createTemplateCall( $component ) . "\n";
				}
			} elseif ( get_class( $component ) == 'PFWikiPageSection' ) {
				if ( $component->getText() !== "" || $component->isHideIfEmpty() === false ) {
					$sectionName = $component->getHeader();
					for ( $i = 0; $i < $component->getHeaderLevel(); $i++ ) {
						$sectionName = "=$sectionName=";
					}
					$pageText .= "$sectionName\n";
					if ( $component->getText() != '' ) {
						$pageText .= $component->getText() . "\n";
					}
					$pageText .= "\n";
				}
			} elseif ( get_class( $component ) == 'PFWikiPageFreeText' ) {
				$freeText = $component->getText();
				if ( $this->mFreeTextOnlyInclude ) {
					$freeText = "<onlyinclude>$freeText</onlyinclude>";
				}
				$pageText .= "$freeText\n";
			}
		}
		return $pageText;
	}
}
