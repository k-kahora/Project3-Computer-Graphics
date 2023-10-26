
{
  description = "web flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    # Do precise filtering of files in the nix store
    nix-filter.url = "github:numtide/nix-filter";
  };

  outputs = { self, nixpkgs, flake-utils, nix-filter}:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodePackages = pkgs.nodePackages;
        lib = pkgs.lib;
      in
      {
      devShells = {
        default = pkgs.mkShell {
          packages = [
            nodePackages.node2nix
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.vscode-css-languageserver-bin
            nodePackages.vscode-html-languageserver-bin  
          ];
        };

       };
     }
    );
}
