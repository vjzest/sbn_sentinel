import sys

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_end = '''        </div>
      </div>
    </div>
  );
};'''

new_end = '''        </div>
      </div>
      </div>
    </div>
  );
};'''

code = code.replace(old_end, new_end)

with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
