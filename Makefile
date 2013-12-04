
build: components index.js tags.css
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

index.js: index.jsx
	@jsx index.jsx > index.js

.PHONY: clean
