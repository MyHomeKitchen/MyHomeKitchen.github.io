import os
import json

catalog_path = r'i:\Projects\open webs\kiranashops.github.io\catalog'
missing_images = []

for folder in os.listdir(catalog_path):
    folder_path = os.path.join(catalog_path, folder)
    if os.path.isdir(folder_path):
        data_json_path = os.path.join(folder_path, 'data.json')
        if os.path.exists(data_json_path):
            with open(data_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                items = data.get('items', [])
                for item in items:
                    image_name = item.get('image')
                    if image_name:
                        image_path = os.path.join(folder_path, image_name)
                        if not os.path.exists(image_path):
                            missing_images.append({
                                'folder': folder,
                                'name': item.get('name'),
                                'image': image_name,
                                'id': item.get('id')
                            })

print(json.dumps(missing_images, indent=2))
