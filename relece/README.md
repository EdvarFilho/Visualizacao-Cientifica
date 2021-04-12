# REleCe: Análises e visualizações sobre o censo e resultado eleitoral de 2020 no Estado do Ceará

https://observablehq.com/@edvarfilho/relece-analises-e-visualizacoes-sobre-o-censo-e-resultado-e@1423

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
python -m SimpleHTTPServer
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@4
npm install https://api.observablehq.com/d/40b5ddff0e222171.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "@edvarfilho/relece-analises-e-visualizacoes-sobre-o-censo-e-resultado-e";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
