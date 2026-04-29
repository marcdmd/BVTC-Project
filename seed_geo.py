import json
import os
import django

# Django usually converts hyphens to underscores for the inner config folder
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BVTC_Project.settings')
django.setup()

from BVTCApp.models import Province, City, Barangay

def run_seed():
    file_path = 'philippine_provinces_cities_municipalities_and_barangays_2019v2.json'
    
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found. Ensure it's in the same folder as this script.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("Starting seed... this will take about 30-60 seconds.")
    
    for reg_code, reg_data in data.items():
        prov_list = reg_data.get('province_list', {})
        
        for prov_name, prov_data in prov_list.items():
            # Get or create Province
            province_obj, _ = Province.objects.get_or_create(name=prov_name)
            
            muni_list = prov_data.get('municipality_list', {})
            for muni_name, muni_data in muni_list.items():
                # Get or create City/Municipality
                city_obj, _ = City.objects.get_or_create(
                    province=province_obj, 
                    name=muni_name
                )
                
                # Bulk create Barangays that don't exist yet
                brgy_names = muni_data.get('barangay_list', [])
                existing_brgys = set(
                    Barangay.objects.filter(city=city_obj, name__in=brgy_names)
                    .values_list('name', flat=True)
                )
                
                new_brgys = [
                    Barangay(city=city_obj, name=name) 
                    for name in brgy_names if name not in existing_brgys
                ]
                
                if new_brgys:
                    Barangay.objects.bulk_create(new_brgys)
            
            print(f"Processed: {prov_name}")

    print("\n✅ Success! Geography data is now in your database.")

if __name__ == '__main__':
    run_seed()