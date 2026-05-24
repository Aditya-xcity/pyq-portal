#!/usr/bin/env python3
"""
BTech_CSE Folder Manifest Generator

This script scans the BTech_CSE folder and generates a JSON manifest
that the website uses to display the folder structure dynamically.

Run this script whenever you add/remove folders or PDFs in BTech_CSE:
    python generate_manifest.py

For automatic sync, you can set up a file watcher or run this periodically.
"""

import os
import json
from datetime import datetime
from pathlib import Path

# Configuration
BTECH_CSE_FOLDER = "BTech_CSE"
OUTPUT_FILE = "website/folder_manifest.json"
OUTPUT_JS_FILE = "website/folder_manifest.js"
BASE_PATH = os.path.dirname(os.path.abspath(__file__))

def get_folder_structure(root_path, relative_base=""):
    """
    Recursively scan folder structure and build a nested dictionary.
    
    Returns a structure like:
    {
        "name": "folder_name",
        "type": "folder",
        "path": "relative/path",
        "children": [...]  # nested folders and files
    }
    """
    structure = {
        "name": os.path.basename(root_path),
        "type": "folder",
        "path": relative_base,
        "children": []
    }
    
    try:
        items = sorted(os.listdir(root_path))
    except PermissionError:
        return structure
    
    for item in items:
        item_path = os.path.join(root_path, item)
        relative_path = os.path.join(relative_base, item) if relative_base else item
        
        if os.path.isdir(item_path):
            # Recursively get subfolder structure
            child_structure = get_folder_structure(item_path, relative_path)
            structure["children"].append(child_structure)
        else:
            # It's a file
            file_size = os.path.getsize(item_path)
            file_ext = os.path.splitext(item)[1].lower()
            
            file_info = {
                "name": item,
                "type": "file",
                "path": relative_path.replace("\\", "/"),
                "size": file_size,
                "size_mb": round(file_size / (1024 * 1024), 2),
                "extension": file_ext
            }
            structure["children"].append(file_info)
    
    # Convert path separators to forward slashes for web compatibility
    structure["path"] = structure["path"].replace("\\", "/")
    
    return structure


def generate_manifest():
    """Generate the folder manifest JSON file."""
    btech_path = os.path.join(BASE_PATH, BTECH_CSE_FOLDER)
    
    if not os.path.exists(btech_path):
        print(f"Error: {BTECH_CSE_FOLDER} folder not found at {btech_path}")
        return False
    
    print(f"Scanning {BTECH_CSE_FOLDER} folder...")
    
    # Get the folder structure
    folder_structure = get_folder_structure(btech_path)
    
    # Count totals
    def count_items(node, counts=None):
        if counts is None:
            counts = {"folders": 0, "files": 0, "pdfs": 0}
        
        if node["type"] == "folder":
            counts["folders"] += 1
            for child in node.get("children", []):
                count_items(child, counts)
        else:
            counts["files"] += 1
            if node.get("extension", "").lower() == ".pdf":
                counts["pdfs"] += 1
        
        return counts
    
    counts = count_items(folder_structure)
    
    # Build the manifest
    manifest = {
        "generated": datetime.now().isoformat(),
        "base_folder": BTECH_CSE_FOLDER,
        "stats": {
            "total_folders": counts["folders"],
            "total_files": counts["files"],
            "total_pdfs": counts["pdfs"]
        },
        "structure": folder_structure
    }
    
    # Write to file
    output_path = os.path.join(BASE_PATH, OUTPUT_FILE)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    manifest_json = json.dumps(manifest, indent=2, ensure_ascii=False)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(manifest_json)

    js_output_path = os.path.join(BASE_PATH, OUTPUT_JS_FILE)
    with open(js_output_path, 'w', encoding='utf-8') as f:
        f.write(f"window.__PYQ_FOLDER_MANIFEST__ = {manifest_json};\n")
    
    print(f"\nManifest generated successfully!")
    print(f"Output: {output_path}")
    print(f"Statistics:")
    print(f"  - Folders: {counts['folders']}")
    print(f"  - Files: {counts['files']}")
    print(f"  - PDFs: {counts['pdfs']}")
    
    return True


if __name__ == "__main__":
    generate_manifest()
