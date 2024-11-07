#!/bin/bash

# Define source and target directories
src_dir="/home/An_Xing/projects/Obsidian-Plugins/obsidian-redirect/custom-uri-redirect-plugin"
dest_dir="/mnt/c/Users/jaxba/Documents/Vaults/Test/Test/.obsidian/plugins/custom-uri-redirect-plugin"

# Ensure the target directory exists
mkdir -p "$dest_dir"

# List of files to copy
files=(
    "README.md"
    "build/main.js"
    "main.ts"
    "manifest.json"
    "obsidian.d.ts"
    "package-lock.json"
    "package.json"
    "rollup.config.js"
    "style.css"
    "tsconfig.json"
)

# Loop through each file and copy it to the destination
for file in "${files[@]}"; do
    # Check if it's in a subdirectory (build/main.js case)
    if [[ "$file" == "build/main.js" ]]; then
        cp "$src_dir/$file" "$dest_dir/main.js"  # Copy build/main.js as main.js in the target
    else
        cp "$src_dir/$file" "$dest_dir/"  # Copy all other files to the target directory
    fi
done

echo "Files have been copied to $dest_dir, replacing any existing files."
