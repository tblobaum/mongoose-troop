 

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--ignore-leaks \
		./test/*.test.js

clean:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--ignore-leaks \
		./test/cleanup.js


.PHONY: test
