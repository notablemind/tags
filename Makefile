
build: components index.js tags.css
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

index.js: index.jsx
	@jsx index.jsx > index.js

test/react.js:
	@curl -L -o test/react.js http://fb.me/react-0.5.1.js

example: test/react.js build
	@xdg-open test/example.html

.PHONY: clean
