
build: components index.js tags.css
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

blanket:
	@mocha -R html-cov --require blanket > coverage.html

index.js: index.jsx
	@jsx index.jsx > index.js

test:
	@mocha -R spec

test/react.js:
	@curl -L -o test/react.js http://fb.me/react-0.5.1.js

example: test/react.js build
	@xdg-open test/example.html

gh-pages: test/react.js build
	rm -rf web
	cp -r test web
	rm web/index.js web/index.css
	cp build/build.js web/index.js
	cp build/build.css web/index.css
	git co gh-pages
	mv web/* ./
	rm -rf web

.PHONY: clean test
