package tree_sitter_abyss_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-abyss"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_abyss.Language())
	if language == nil {
		t.Errorf("Error loading Abyss grammar")
	}
}
