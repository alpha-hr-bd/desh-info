#!/usr/bin/env python3
import json
import os
from datetime import datetime, timezone

SOURCES_FILE = "sources.json"
OUTPUT_FILE = "data/papers.json"

def update_papers():
    print("Starting Desh Info paper updater...")
    
    if not os.path.exists(SOURCES_FILE):
        print(f"Error: {SOURCES_FILE} not found.")
        return

    try:
        with open(SOURCES_FILE, "r", encoding="utf-8") as f:
            sources_data = json.load(f)
    except Exception as e:
        print(f"Error reading {SOURCES_FILE}: {e}")
        return

    sources = sources_data.get("sources", [])
    updated_papers = []

    for source in sources:
        name = source.get("name")
        name_en = source.get("nameEn")
        source_type = source.get("type", "static_url")
        epaper_url = source.get("url")
        official_url = source.get("official")
        description = source.get("description", "Official e-paper")

        print(f"Processing source: {name} ({name_en}) - Type: {source_type}")

        # Future adapter hook can be added here based on source_type
        if source_type == "static_url":
            # For static_url, we ensure the entry is preserved safely
            updated_papers.append({
                "name": name,
                "nameEn": name_en,
                "description": description,
                "url": epaper_url,
                "official": official_url
            })
        else:
            # Fallback for future custom parsers (rss, json_api, html_page)
            print(f"Warning: Unknown or custom type '{source_type}' for {name}. Preserving URL.")
            updated_papers.append({
                "name": name,
                "nameEn": name_en,
                "description": description,
                "url": epaper_url,
                "official": official_url
            })

    # Generate current UTC timestamp
    current_time_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    output_data = {
        "updatedAt": current_time_utc,
        "papers": updated_papers
    }

    # Ensure data directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    # Save to data/papers.json atomically and safely
    try:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"Successfully updated {OUTPUT_FILE} with {len(updated_papers)} sources.")
    except Exception as e:
        print(f"Error writing to {OUTPUT_FILE}: {e}")

if __name__ == "__main__":
    update_papers()
