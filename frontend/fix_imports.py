import sys

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We need to find the lucide-react import and add these: Sparkles, Database, CreditCard, Shield
# Let's just find "from 'lucide-react';" and append our new ones if they aren't there.
import_line = "import { "
if "lucide-react" in code:
    import_block_start = code.find("import {", 0)
    import_block_end = code.find("} from 'lucide-react';", import_block_start)
    if import_block_start != -1 and import_block_end != -1:
        current_imports = code[import_block_start+8:import_block_end]
        new_icons = ["Sparkles", "Database", "CreditCard", "Shield"]
        for icon in new_icons:
            if icon not in current_imports:
                current_imports += ", " + icon
        new_import_stmt = "import {" + current_imports + "} from 'lucide-react';"
        
        # Replace the old import block
        code = code[:import_block_start] + new_import_stmt + code[import_block_end + 22:]
        
        with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
            f.write(code)
        print("Fixed imports")
