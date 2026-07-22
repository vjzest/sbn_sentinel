import sys

with open('src/components/Auth/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make the container wider and reduce padding to save vertical space
code = code.replace('max-w-md p-10', 'max-w-2xl p-8')
# Reduce overall spacing between rows
code = code.replace('space-y-5', 'space-y-3')
code = code.replace('space-y-4 mb-4', 'space-y-3 mb-3')
code = code.replace('gap-4', 'gap-3')
# Reduce padding on the inputs to save height
code = code.replace('py-3.5', 'py-2.5')

# Also, place email and password side by side if we are registering
# We need to target the email and password divs carefully, but maybe it's too much.
# Let's just rely on the padding and gap reduction first. It will significantly reduce height.

with open('src/components/Auth/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
