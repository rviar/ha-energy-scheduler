var EnergySchedulerCard=function(t){"use strict";var e,i=Object.defineProperty,s=(t,e,s)=>((t,e,s)=>e in t?i(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s)(t,"symbol"!=typeof e?e+"":e,s);const o=globalThis,n=o.ShadowRoot&&(void 0===o.ShadyCSS||o.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),r=new WeakMap;let l=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(n&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const h=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new l(i,t,a)},c=n?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new l("string"==typeof t?t:t+"",void 0,a))(e)})(t):t,{is:d,defineProperty:u,getOwnPropertyDescriptor:p,getOwnPropertyNames:g,getOwnPropertySymbols:f,getPrototypeOf:m}=Object,b=globalThis,x=b.trustedTypes,v=x?x.emptyScript:"",_=b.reactiveElementPolyfillSupport,y=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(s){i=null}}return i}},k=(t,e)=>!d(t,e),C={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),b.litPropertyMetadata??(b.litPropertyMetadata=new WeakMap);let M=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=C){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&u(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=null==s?void 0:s.call(this);null==o||o.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??C}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=m(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...g(t),...f(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const t=this._$Eu(e,i);void 0!==t&&this._$Eh.set(t,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(c(t))}else void 0!==t&&e.push(c(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),null==(t=this.constructor.l)||t.forEach(t=>t(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),void 0!==this.renderRoot&&this.isConnected&&(null==(e=t.hostConnected)||e.call(t))}removeController(t){var e;null==(e=this._$EO)||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(n)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of e){const e=document.createElement("style"),s=o.litNonce;void 0!==s&&e.setAttribute("nonce",s),e.textContent=i.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null==(t=this._$EO)||t.forEach(t=>{var e;return null==(e=t.hostConnected)?void 0:e.call(t)})}enableUpdating(t){}disconnectedCallback(){var t;null==(t=this._$EO)||t.forEach(t=>{var e;return null==(e=t.hostDisconnected)?void 0:e.call(t)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){var i;const s=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,s);if(void 0!==o&&!0===s.reflect){const n=(void 0!==(null==(i=s.converter)?void 0:i.toAttribute)?s.converter:w).toAttribute(e,s.type);this._$Em=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){var i,s;const o=this.constructor,n=o._$Eh.get(t);if(void 0!==n&&this._$Em!==n){const t=o.getPropertyOptions(n),a="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null==(i=t.converter)?void 0:i.fromAttribute)?t.converter:w;this._$Em=n;const r=a.fromAttribute(e,t.type);this[n]=r??(null==(s=this._$Ej)?void 0:s.get(n))??r,this._$Em=null}}requestUpdate(t,e,i){var s;if(void 0!==t){const o=this.constructor,n=this[t];if(i??(i=o.getPropertyOptions(t)),!((i.hasChanged??k)(n,e)||i.useDefault&&i.reflect&&n===(null==(s=this._$Ej)?void 0:s.get(t))&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null==(t=this._$EO)||t.forEach(t=>{var e;return null==(e=t.hostUpdate)?void 0:e.call(t)}),this.update(i)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null==(e=this._$EO)||e.forEach(t=>{var e;return null==(e=t.hostUpdated)?void 0:e.call(t)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(t){}firstUpdated(t){}};M.elementStyles=[],M.shadowRootOptions={mode:"open"},M[y("elementProperties")]=new Map,M[y("finalized")]=new Map,null==_||_({ReactiveElement:M}),(b.reactiveElementVersions??(b.reactiveElementVersions=[])).push("2.1.1");const S=globalThis,P=S.trustedTypes,A=P?P.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,D="?"+$,O=`<${D}>`,T=document,L=()=>T.createComment(""),R=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,I="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,V=/-->/g,H=/>/g,N=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,W=/"/g,j=/^(?:script|style|textarea|title)$/i,U=(K=1,(t,...e)=>({_$litType$:K,strings:t,values:e})),Y=Symbol.for("lit-noChange"),X=Symbol.for("lit-nothing"),q=new WeakMap,G=T.createTreeWalker(T,129);var K;function J(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,n=0;const a=t.length-1,r=this.parts,[l,h]=((t,e)=>{const i=t.length-1,s=[];let o,n=2===e?"<svg>":3===e?"<math>":"",a=F;for(let r=0;r<i;r++){const e=t[r];let i,l,h=-1,c=0;for(;c<e.length&&(a.lastIndex=c,l=a.exec(e),null!==l);)c=a.lastIndex,a===F?"!--"===l[1]?a=V:void 0!==l[1]?a=H:void 0!==l[2]?(j.test(l[2])&&(o=RegExp("</"+l[2],"g")),a=N):void 0!==l[3]&&(a=N):a===N?">"===l[0]?(a=o??F,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,i=l[1],a=void 0===l[3]?N:'"'===l[3]?W:B):a===W||a===B?a=N:a===V||a===H?a=F:(a=N,o=void 0);const d=a===N&&t[r+1].startsWith("/>")?" ":"";n+=a===F?e+O:h>=0?(s.push(i),e.slice(0,h)+E+e.slice(h)+$+d):e+$+(-2===h?r:d)}return[J(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]})(t,e);if(this.el=Z.createElement(l,i),G.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=G.nextNode())&&r.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(E)){const e=h[n++],i=s.getAttribute(t).split($),a=/([.?@])?(.*)/.exec(e);r.push({type:1,index:o,name:a[2],strings:i,ctor:"."===a[1]?st:"?"===a[1]?ot:"@"===a[1]?nt:it}),s.removeAttribute(t)}else t.startsWith($)&&(r.push({type:6,index:o}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split($),e=t.length-1;if(e>0){s.textContent=P?P.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],L()),G.nextNode(),r.push({type:2,index:++o});s.append(t[e],L())}}}else if(8===s.nodeType)if(s.data===D)r.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf($,t+1));)r.push({type:7,index:o}),t+=$.length-1}o++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){var o,n;if(e===Y)return e;let a=void 0!==s?null==(o=i._$Co)?void 0:o[s]:i._$Cl;const r=R(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==r&&(null==(n=null==a?void 0:a._$AO)||n.call(a,!1),void 0===r?a=void 0:(a=new r(t),a._$AT(t,i,s)),void 0!==s?(i._$Co??(i._$Co=[]))[s]=a:i._$Cl=a),void 0!==a&&(e=Q(t,a._$AS(t,e.values),a,s)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=((null==t?void 0:t.creationScope)??T).importNode(e,!0);G.currentNode=s;let o=G.nextNode(),n=0,a=0,r=i[0];for(;void 0!==r;){if(n===r.index){let e;2===r.type?e=new et(o,o.nextSibling,this,t):1===r.type?e=new r.ctor(o,r.name,r.strings,this,t):6===r.type&&(e=new at(o,this,t)),this._$AV.push(e),r=i[++a]}n!==(null==r?void 0:r.index)&&(o=G.nextNode(),n++)}return G.currentNode=T,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){var t;return(null==(t=this._$AM)?void 0:t._$AU)??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=X,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=(null==s?void 0:s.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),R(t)?t===X||null==t||""===t?(this._$AH!==X&&this._$AR(),this._$AH=X):t!==this._$AH&&t!==Y&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==X&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){var e;const{values:i,_$litType$:s}=t,o="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Z.createElement(J(s.h,s.h[0]),this.options)),s);if((null==(e=this._$AH)?void 0:e._$AD)===o)this._$AH.p(i);else{const t=new tt(o,this),e=t.u(this.options);t.p(i),this.T(e),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new Z(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new et(this.O(L()),this.O(L()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null==(i=this._$AP)||i.call(this,!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cv=t,null==(e=this._$AP)||e.call(this,t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=X,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=X}_$AI(t,e=this,i,s){const o=this.strings;let n=!1;if(void 0===o)t=Q(this,t,e,0),n=!R(t)||t!==this._$AH&&t!==Y,n&&(this._$AH=t);else{const s=t;let a,r;for(t=o[0],a=0;a<o.length-1;a++)r=Q(this,s[i+a],e,a),r===Y&&(r=this._$AH[a]),n||(n=!R(r)||r!==this._$AH[a]),r===X?t=X:t!==X&&(t+=(r??"")+o[a+1]),this._$AH[a]=r}n&&!s&&this.j(t)}j(t){t===X?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===X?void 0:t}}class ot extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==X)}}class nt extends it{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??X)===Y)return;const i=this._$AH,s=t===X&&i!==X||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==X&&(i===X||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;"function"==typeof this._$AH?this._$AH.call((null==(e=this.options)?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const rt=S.litHtmlPolyfillSupport;null==rt||rt(Z,et),(S.litHtmlVersions??(S.litHtmlVersions=[])).push("3.3.1");const lt=globalThis;class ht extends M{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=(null==i?void 0:i.renderBefore)??e;let o=s._$litPart$;if(void 0===o){const t=(null==i?void 0:i.renderBefore)??null;s._$litPart$=o=new et(e.insertBefore(L(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null==(t=this._$Do)||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null==(t=this._$Do)||t.setConnected(!1)}render(){return Y}}ht._$litElement$=!0,ht.finalized=!0,null==(e=lt.litElementHydrateSupport)||e.call(lt,{LitElement:ht});const ct=lt.litElementPolyfillSupport;null==ct||ct({LitElement:ht}),(lt.litElementVersions??(lt.litElementVersions=[])).push("4.2.1");const dt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ut={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:k},pt=(t=ut,e,i)=>{const{kind:s,metadata:o}=i;let n=globalThis.litPropertyMetadata.get(o);if(void 0===n&&globalThis.litPropertyMetadata.set(o,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t)}}throw Error("Unsupported decorator location: "+s)};function gt(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ft(t){return gt({...t,state:!0,attribute:!1})}const mt=h`
  :host {
    --es-color-charge: #43A047;
    --es-color-charge-ev: #1E88E5;
    --es-color-force-charge: #8E24AA;
    --es-color-discharge: #E64A19;
    --es-color-solar: #FB8C00;
    --es-color-self-consume: #FDD835;
    --es-color-idle: #78909C;
    --es-color-manual: #FB8C00;
    --es-color-current: #43A047;
    --es-radius-card: var(--ha-card-border-radius, 12px);
    --es-radius-lg: 16px;
    --es-radius-md: 12px;
    --es-radius-sm: 8px;
    --es-radius-pill: 20px;
    --es-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ha-card {
    overflow: hidden;
    border-radius: var(--es-radius-card);
  }

  .card-content { padding: 0; }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 12px;
  }
  .card-header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--es-radius-md);
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    color: var(--primary-color);
    --mdc-icon-size: 22px;
    flex-shrink: 0;
  }
  .card-header-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
    letter-spacing: -0.01em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    line-height: 1;
    --mdc-icon-size: 18px;
  }
  .btn ha-icon { display: flex; }
  .btn:hover { filter: brightness(0.93); }
  .btn:active { transform: scale(0.96); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; filter: none; }
  .btn-primary {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .btn-secondary {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
    color: var(--primary-color);
  }
  .btn-secondary:hover {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
  }
  .btn-danger {
    background: rgba(229, 57, 53, 0.1);
    color: var(--error-color, #E53935);
  }
  .btn-warning {
    background: rgba(251, 140, 0, 0.1);
    color: var(--warning-color, #FB8C00);
  }
  .btn-icon-only {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 10px;
  }

  .notification {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    padding: 12px 24px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-radius: var(--es-radius-md);
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
  .notification.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .notification.error { background: var(--error-color, #E53935); }

  .section-block {
    background: var(--card-background-color, #fff);
    border-radius: var(--es-radius-lg);
    padding: 16px;
    margin-bottom: 12px;
  }
  .section-block:last-child { margin-bottom: 0; }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color);
    margin: 0 0 12px 0;
  }

  /* Loading state */
  .card-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    gap: 16px;
  }
  .card-loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: es-spin 0.8s linear infinite;
  }
  .card-loading-text {
    color: var(--secondary-text-color);
    font-size: 14px;
  }

  /* Error state */
  .card-error {
    text-align: center;
    padding: 40px 16px;
  }
  .card-error-icon {
    font-size: 36px;
    margin-bottom: 12px;
    opacity: 0.7;
  }
  .card-error-message {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  @keyframes es-spin { to { transform: rotate(360deg); } }
`,bt=h`
  :host { display: block; }
  .status-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 16px 12px;
  }
  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    font-size: 13px;
    transition: background 0.2s ease;
    min-width: 0;
  }
  .status-item .status-icon {
    flex-shrink: 0;
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
    display: flex;
  }
  .status-item .status-value {
    font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }
  .status-item .status-value.mode {
    max-width: 100px;
    font-size: 12px;
    font-weight: 500;
  }
  .status-item.profit {
    background: rgba(76, 175, 80, 0.1);
  }
  .status-item.profit .status-value {
    color: var(--success-color, #43A047);
  }
  .status-item.paused {
    background: rgba(255, 152, 0, 0.12);
  }
  .status-item.paused .status-value {
    color: var(--warning-color, #FB8C00);
  }
`,xt=h`
  :host { display: block; }
  .tab-bar {
    display: flex;
    gap: 4px;
    padding: 4px 12px 8px;
  }
  .tab {
    flex: 1;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
  }
  .tab:hover {
    color: var(--primary-text-color);
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }
  .tab.active {
    color: var(--primary-color);
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    font-weight: 500;
  }
`,vt=h`
  :host { display: block; }
  .schedule-tab { padding: 12px 16px 16px; }

  .chart-section {
    margin-bottom: 16px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 12px;
  }
  .chart-container {
    position: relative;
    height: var(--chart-height, 250px);
    width: 100%;
  }
  .chart-container canvas { width: 100% !important; height: 100% !important; }
  .chart-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: var(--secondary-text-color);
    font-size: 14px;
  }

  .schedule-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .toolbar-actions { display: flex; gap: 8px; }

  .schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
    gap: 6px;
  }
  .day-separator {
    grid-column: 1 / -1;
    padding: 8px 4px 6px;
    font-weight: 600;
    font-size: 12px;
    color: var(--primary-color);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    margin-top: 4px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .day-separator:first-child { margin-top: 0; }

  .hour-slot {
    padding: 8px 6px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    border: 1.5px solid transparent;
    font-size: 11px;
    position: relative;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
    -webkit-tap-highlight-color: transparent;
  }
  .hour-slot:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .hour-slot:active {
    transform: translateY(0);
  }
  .hour-slot.current {
    border-color: var(--es-color-current);
    box-shadow: 0 0 0 2px rgba(67, 160, 71, 0.2);
  }
  .hour-slot .time {
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 2px;
    color: var(--primary-text-color);
  }
  .hour-slot .prices {
    font-size: 9px;
    color: var(--secondary-text-color);
    display: flex;
    justify-content: center;
    gap: 4px;
  }
  .hour-slot .prices .buy { color: #1E88E5; font-weight: 500; }
  .hour-slot .prices .sell { color: #43A047; font-weight: 500; }
  .hour-slot .action-label {
    font-size: 9px;
    margin-top: 3px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.02em;
  }
  .hour-slot .slot-icon {
    position: absolute;
    top: 3px;
    right: 4px;
    font-size: 10px;
    line-height: 1;
  }
  .hour-slot .hour-badges {
    position: absolute;
    top: 3px;
    left: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    line-height: 1;
  }
  .hour-slot .hour-badges .lock-badge {
    font-size: 9px;
    opacity: 0.7;
  }
  .hour-slot .hour-badges .no-export-badge {
    --mdc-icon-size: 12px;
    width: 12px;
    height: 12px;
    color: var(--error-color, #e53935);
    opacity: 0.85;
  }
  .hour-slot .hour-badges .no-pv-badge {
    --mdc-icon-size: 12px;
    width: 12px;
    height: 12px;
    color: var(--warning-color, #FB8C00);
    opacity: 0.85;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 32px 16px;
    color: var(--secondary-text-color);
    font-size: 14px;
  }
  .loading-placeholder {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 12px;
  }
  .loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Controls bar */
  .controls-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .controls-bar .btn,
  .controls-bar .status-chip,
  .controls-bar .controls-select {
    height: 34px;
    box-sizing: border-box;
  }
  .controls-spacer { flex: 1; min-width: 4px; }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    border-radius: 17px;
    border: none;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    --mdc-icon-size: 16px;
    white-space: nowrap;
  }
  .status-chip ha-icon { display: flex; }
  .status-chip.active {
    background: rgba(67, 160, 71, 0.12);
    color: #43A047;
  }
  .status-chip.active:hover { background: rgba(67, 160, 71, 0.2); }
  .status-chip.paused {
    background: rgba(255, 152, 0, 0.12);
    color: #FB8C00;
  }
  .status-chip.paused:hover { background: rgba(255, 152, 0, 0.2); }

  .controls-select {
    padding: 0 28px 0 10px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color 0.15s ease;
    flex: 1;
    min-width: 0;
  }
  .controls-select:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;h`
  :host { display: block; }
  .control-tab { padding: 12px 16px 16px; }

  .control-block {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .control-block:last-child { margin-bottom: 0; }
  .control-block h3 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
  }
  .control-row + .control-row {
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .control-row label {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .control-row select {
    padding: 8px 12px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.2s ease;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }
  .control-row select:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--secondary-text-color);
    font-weight: 500;
  }
  .toggle-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: var(--divider-color, rgba(0, 0, 0, 0.15));
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 24px;
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
  .toggle-switch input:checked + .toggle-slider { background-color: var(--primary-color); }
  .toggle-switch input:checked + .toggle-slider:before { transform: translateX(20px); }

  .control-actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .control-actions .btn { flex: 1; }

  .apply-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .apply-row select {
    flex: 1;
    padding: 8px 12px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }
  .apply-row select:focus { outline: none; border-color: var(--primary-color); }

  .ev-control-actions { display: flex; gap: 8px; }
  .ev-control-actions .btn { flex: 1; }
`;const _t=h`
  :host { display: block; }
  .ev-tab { padding: 12px 16px 16px; }

  .ev-status {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .ev-status h3 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .status-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .status-field .field-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
  }
  .status-field .field-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .status-field .field-value.connected { color: var(--success-color, #43A047); }
  .status-field .field-value.disconnected { color: var(--error-color, #E53935); }
  .status-field .field-value.charging { color: var(--primary-color); }

  .session-block {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
    border: 1.5px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .session-block h3 {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ev-schedule-list {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
  }
  .ev-schedule-list h3 {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ev-hour-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .ev-hour-item:last-child { border-bottom: none; }
  .ev-hour-time { font-weight: 600; font-size: 14px; color: var(--primary-text-color); }
  .ev-hour-reason {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding: 3px 10px;
    background: var(--card-background-color, rgba(255, 255, 255, 0.6));
    border-radius: 12px;
  }
  .ev-hour-amps { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }

  .ev-control-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .ev-control-bar .btn { flex: 1; }

  .empty-ev {
    text-align: center;
    padding: 24px 16px;
    color: var(--secondary-text-color);
    font-size: 14px;
  }
`,yt=h`
  :host { display: block; }
  .stats-tab { padding: 12px 16px 16px; }

  .stats-block {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .stats-block:last-child { margin-bottom: 0; }
  .stats-block h3 {
    margin: 0 0 14px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .profit-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--success-color, #43A047);
    margin-bottom: 14px;
    letter-spacing: -0.02em;
  }

  .stats-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
  }
  .stats-row .label { color: var(--secondary-text-color); }
  .stats-row .value { font-weight: 600; color: var(--primary-text-color); }

  .hours-list { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px; }
  .hour-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  .hour-chip.charge {
    background: rgba(67, 160, 71, 0.12);
    color: #43A047;
  }
  .hour-chip.discharge {
    background: rgba(230, 74, 25, 0.12);
    color: #E64A19;
  }

  .consumption-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .consumption-header select {
    padding: 6px 10px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 10px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 24px;
  }
  .consumption-header select:focus { outline: none; border-color: var(--primary-color); }

  .consumption-chart {
    height: 120px;
    position: relative;
    background: var(--card-background-color, rgba(255, 255, 255, 0.5));
    border-radius: 12px;
    padding: 8px;
  }
  .consumption-source {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-top: 8px;
    font-style: italic;
  }

  .warning-item {
    padding: 8px 12px;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 10px;
    font-size: 12px;
    color: var(--warning-color, #FB8C00);
    margin-bottom: 6px;
    font-weight: 500;
    border-left: 3px solid var(--warning-color, #FB8C00);
  }
  .warning-item:last-child { margin-bottom: 0; }

  .optimization-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: var(--card-background-color, rgba(255, 255, 255, 0.5));
    border-radius: 12px;
  }
  .meta-item .meta-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
  }
  .meta-item .meta-value {
    font-size: 15px;
    font-weight: 700;
    color: var(--primary-text-color);
  }
`,wt=h`
  :host { display: block; }

  .modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 999;
    justify-content: center;
    align-items: center;
    animation: es-fade-in 0.2s ease;
  }
  .modal-overlay.open { display: flex; }

  .modal {
    background: var(--card-background-color, #fff);
    border-radius: 20px;
    padding: 24px;
    max-width: 380px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
    animation: es-slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--primary-text-color);
    letter-spacing: -0.01em;
  }
  .modal-close {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--secondary-text-color);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    line-height: 1;
  }
  .modal-close:hover {
    background: var(--divider-color, rgba(0, 0, 0, 0.1));
    color: var(--primary-text-color);
  }

  .price-info {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    padding: 14px 16px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
  }
  .price-info .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    color: var(--secondary-text-color);
  }
  .price-info .row:last-child { margin-bottom: 0; }
  .price-info .row span:last-child {
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .form-group { margin-bottom: 16px; }
  .form-group:last-child { margin-bottom: 0; }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .form-group select {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 14px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 14px;
    box-sizing: border-box;
    cursor: pointer;
    transition: border-color 0.2s ease;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }
  .form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
  }

  .form-divider {
    height: 1px;
    background: var(--divider-color, rgba(0, 0, 0, 0.08));
    margin: 16px 0;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
  }
  .toggle-row .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  /* Reuse toggle styles from control */
  .toggle-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: var(--divider-color, rgba(0, 0, 0, 0.15));
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 24px;
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
  .toggle-switch input:checked + .toggle-slider { background-color: var(--primary-color); }
  .toggle-switch input:checked + .toggle-slider:before { transform: translateX(20px); }

  .range-group { padding: 10px 0; }
  .range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .range-header .range-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .range-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--primary-color);
    min-width: 44px;
    text-align: right;
  }
  .range-input {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--divider-color, rgba(0, 0, 0, 0.1));
    outline: none;
    -webkit-appearance: none;
    transition: background 0.2s ease;
  }
  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s ease;
  }
  .range-input::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .range-input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }
  .modal-actions .btn { flex: 1; padding: 12px 16px; }

  @keyframes es-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes es-slide-up {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`,kt=h`
  :host { display: block; }
  .editor { padding: 16px; }

  .form-group { margin-bottom: 16px; }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group select {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--divider-color, rgba(0, 0, 0, 0.1));
    border-radius: 14px;
    font-size: 14px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
  }
  .checkbox-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--primary-color);
    border-radius: 4px;
  }
  .checkbox-row label {
    margin-bottom: 0;
    cursor: pointer;
    font-weight: 500;
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    margin: 20px 0 12px 0;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .section-title:first-child { margin-top: 0; }
`;function Ct(t,e){const i=t.action;return"CHARGE"===i||i===e.mode_charge_battery?t.ev_charging?"charge_ev":"charge":i===e.mode_charge_ev||i===e.mode_charge_ev_and_battery?"charge_ev":i===e.mode_sell?"discharge":i===e.mode_sell_solar_only?"solar":"PV_CHARGE"===i?"pv_charge":"SELF_CONSUME_FIRST"===i||"SELF_CONSUME_ONLY"===i?"self_consume":"PAID_IMPORT"===i?"paid_import":i===e.mode_self_consume?"self_consume":i===e.mode_grid_only?"idle":i!==e.default_mode&&i?"other":"idle"}const Mt={charge:"#4CAF50",charge_ev:"#2196F3",discharge:"#FF5722",solar:"#FF9800",pv_charge:"#8BC34A",self_consume:"#FFC107",paid_import:"#00BCD4",idle:"#9E9E9E",other:"#607D8B"},St={charge:"rgba(76, 175, 80, 0.15)",charge_ev:"rgba(33, 150, 243, 0.15)",discharge:"rgba(255, 87, 34, 0.15)",solar:"rgba(255, 152, 0, 0.15)",pv_charge:"rgba(139, 195, 74, 0.15)",self_consume:"rgba(255, 193, 7, 0.15)",paid_import:"rgba(0, 188, 212, 0.15)",idle:"rgba(158, 158, 158, 0.08)",other:"rgba(96, 125, 139, 0.1)"};function Pt(t){return St[t]}const At={charge:"mdi:battery-charging",charge_ev:"mdi:car-electric",discharge:"mdi:battery-arrow-down",solar:"mdi:solar-power",pv_charge:"mdi:solar-panel",self_consume:"mdi:home-battery",paid_import:"mdi:cash-plus",idle:"",other:"mdi:help-circle-outline"};const Et={charge:"Charge",charge_ev:"Charge + EV",discharge:"Discharge",solar:"Solar Only",pv_charge:"PV Charge",self_consume:"Self-Consume",paid_import:"Paid Import",idle:"Idle",other:"Other"};const $t={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};function Dt(t){const e=new Date;if(!t){return{date:`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`,hour:e.getHours(),weekday:e.getDay()}}const i=new Intl.DateTimeFormat("en-US",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",weekday:"short",hour12:!1}).formatToParts(e),s=t=>{var e;return(null==(e=i.find(e=>e.type===t))?void 0:e.value)??""};let o=s("hour");return"24"===o&&(o="00"),{date:`${s("year")}-${s("month")}-${s("day")}`,hour:parseInt(o,10),weekday:$t[s("weekday")]??0}}function Ot(t){const[e,i,s]=t.split("-").map(Number);return new Date(e,(i??1)-1,s??1).getDay()}function Tt(t){const[,e,i]=t.split("-").map(Number);return{day:i??1,month:e??1}}function Lt(t){return Dt(t).date}function Rt(t){const[e,i,s]=Lt(t).split("-").map(Number),o=new Date(Date.UTC(e,i-1,s)+864e5);return`${o.getUTCFullYear()}-${String(o.getUTCMonth()+1).padStart(2,"0")}-${String(o.getUTCDate()).padStart(2,"0")}`}function zt(t){const{date:e,hour:i}=Dt(t);return{date:e,hour:i}}function It(t){return`${t.toString().padStart(2,"0")}:00`}function Ft(t,e){const{day:i,month:s}=Tt(t);return`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][Ot(t)]} ${i}/${s} ${It(e)}`}function Vt(t,e){const i=Lt(e),s=Rt(e);return t===i?"Today":t===s?"Tomorrow":function(t){const{day:e,month:i}=Tt(t);return`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][Ot(t)]} ${e}/${i}`}(t)}function Ht(t,e=2,i="€"){return null==t?"-":`${t.toFixed(e)} ${i}`}function Nt(t,e,i){const{date:s,hour:o}=zt(i),n=[],a=new Set;return[...t,...e].forEach(i=>{var r,l;const h=`${i.date}-${i.hour}`;a.has(h)||i.date===s&&i.hour<o||i.date<s||(a.add(h),n.push({date:i.date,hour:i.hour,buyPrice:null==(r=t.find(t=>t.date===i.date&&t.hour===i.hour))?void 0:r.value,sellPrice:null==(l=e.find(t=>t.date===i.date&&t.hour===i.hour))?void 0:l.value}))}),n.sort((t,e)=>t.date!==e.date?t.date.localeCompare(e.date):t.hour-e.hour),n}const Bt=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Wt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];const jt="hacs_energy_scheduler",Ut=`${jt}_updated`;async function Yt(t){return t.callApi("GET",`${jt}/config`)}async function Xt(t){return t.callApi("GET",`${jt}/data`)}const qt="4.6.1";var Gt=Object.defineProperty,Kt=Object.getOwnPropertyDescriptor,Jt=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?Kt(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&Gt(e,i,n),n};let Zt=class extends ht{constructor(){super(...arguments),this.priceDecimals=2,this.currency="€"}_getEntityState(t){var e;if(t&&this.hass)return null==(e=this.hass.states[t])?void 0:e.state}_renderPvConfidence(){var t;const e=null==(t=this.data)?void 0:t.pv_dynamic;if(!e||!e.active)return X;const i=Math.round(100*e.factor);let s="var(--success-color, #43a047)";i<50?s="var(--error-color, #e53935)":i<80&&(s="var(--warning-color, #fb8c00)");const o=`PV dynamic factor: ${i}% (actual ${(e.actual_today_kwh??0).toFixed(1)} kWh / baseline ${(e.baseline_elapsed_kwh??0).toFixed(1)} kWh)`;return U`
      <div class="status-item" title=${o} style="color: ${s}">
        <ha-icon class="status-icon" icon="mdi:weather-sunny"></ha-icon>
        <span class="status-value">${i}%</span>
      </div>
    `}render(){var t,e,i,s,o,n,a,r;const l=this._getEntityState(null==(t=this.integrationConfig)?void 0:t.soc_sensor),h=(null==(e=this.data)?void 0:e.buy_prices)?function(t,e){var i;const{date:s,hour:o}=zt(e);return null==(i=t.find(t=>t.date===s&&t.hour===o))?void 0:i.value}(this.data.buy_prices,null==(s=null==(i=this.hass)?void 0:i.config)?void 0:s.time_zone):void 0,c=null==(n=null==(o=this.data)?void 0:o.last_optimization)?void 0:n.estimated_profit,d=this._getEntityState(null==(a=this.integrationConfig)?void 0:a.ev_soc_sensor),u=null==(r=this.integrationConfig)?void 0:r.ev_enabled;return U`
      <div class="status-bar">
        <div class="status-item">
          <ha-icon class="status-icon" icon="mdi:battery"></ha-icon>
          <span class="status-value">${l??"--"}%</span>
        </div>
        <div class="status-item">
          <ha-icon class="status-icon" icon="mdi:tag-outline"></ha-icon>
          <span class="status-value">${Ht(h,this.priceDecimals,this.currency)}</span>
        </div>
        <div class="status-item profit">
          <ha-icon class="status-icon" icon="mdi:cash-plus"></ha-icon>
          <span class="status-value">
            ${null!=c?`+${c.toFixed(2)} ${this.currency}`:"--"}
          </span>
        </div>
        ${this._renderPvConfidence()}
        ${u?U`
              <div class="status-item">
                <ha-icon class="status-icon" icon="mdi:car-electric"></ha-icon>
                <span class="status-value">${d??"--"}%</span>
              </div>
            `:X}
      </div>
    `}};Zt.styles=bt,Jt([gt({attribute:!1})],Zt.prototype,"hass",2),Jt([gt({attribute:!1})],Zt.prototype,"data",2),Jt([gt({attribute:!1})],Zt.prototype,"integrationConfig",2),Jt([gt({type:Number})],Zt.prototype,"priceDecimals",2),Jt([gt({type:String})],Zt.prototype,"currency",2),Zt=Jt([dt("es-status-bar")],Zt);var Qt=Object.defineProperty,te=Object.getOwnPropertyDescriptor,ee=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?te(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&Qt(e,i,n),n};let ie=class extends ht{constructor(){super(...arguments),this.activeTab="schedule",this.showEvTab=!1,this._tabs=[{id:"schedule",label:"Schedule"},{id:"ev",label:"EV"},{id:"stats",label:"Stats"}]}render(){const t=this._tabs.filter(t=>"ev"!==t.id||this.showEvTab);return U`
      <div class="tab-bar">
        ${t.map(t=>U`
            <button
              class="tab ${t.id===this.activeTab?"active":""}"
              @click=${()=>this._selectTab(t.id)}
            >
              ${t.label}
            </button>
          `)}
      </div>
    `}_selectTab(t){this.dispatchEvent(new CustomEvent("tab-changed",{detail:{tab:t},bubbles:!0,composed:!0}))}};function se(t){return t+.5|0}ie.styles=xt,ee([gt({type:String})],ie.prototype,"activeTab",2),ee([gt({type:Boolean})],ie.prototype,"showEvTab",2),ie=ee([dt("es-tab-bar")],ie);const oe=(t,e,i)=>Math.max(Math.min(t,i),e);function ne(t){return oe(se(2.55*t),0,255)}function ae(t){return oe(se(255*t),0,255)}function re(t){return oe(se(t/2.55)/100,0,1)}function le(t){return oe(se(100*t),0,100)}const he={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15,a:10,b:11,c:12,d:13,e:14,f:15},ce=[..."0123456789ABCDEF"],de=t=>ce[15&t],ue=t=>ce[(240&t)>>4]+ce[15&t],pe=t=>(240&t)>>4==(15&t);function ge(t){var e=(t=>pe(t.r)&&pe(t.g)&&pe(t.b)&&pe(t.a))(t)?de:ue;return t?"#"+e(t.r)+e(t.g)+e(t.b)+((t,e)=>t<255?e(t):"")(t.a,e):void 0}const fe=/^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;function me(t,e,i){const s=e*Math.min(i,1-i),o=(e,o=(e+t/30)%12)=>i-s*Math.max(Math.min(o-3,9-o,1),-1);return[o(0),o(8),o(4)]}function be(t,e,i){const s=(s,o=(s+t/60)%6)=>i-i*e*Math.max(Math.min(o,4-o,1),0);return[s(5),s(3),s(1)]}function xe(t,e,i){const s=me(t,1,.5);let o;for(e+i>1&&(o=1/(e+i),e*=o,i*=o),o=0;o<3;o++)s[o]*=1-e-i,s[o]+=e;return s}function ve(t){const e=t.r/255,i=t.g/255,s=t.b/255,o=Math.max(e,i,s),n=Math.min(e,i,s),a=(o+n)/2;let r,l,h;return o!==n&&(h=o-n,l=a>.5?h/(2-o-n):h/(o+n),r=function(t,e,i,s,o){return t===o?(e-i)/s+(e<i?6:0):e===o?(i-t)/s+2:(t-e)/s+4}(e,i,s,h,o),r=60*r+.5),[0|r,l||0,a]}function _e(t,e,i,s){return(Array.isArray(e)?t(e[0],e[1],e[2]):t(e,i,s)).map(ae)}function ye(t,e,i){return _e(me,t,e,i)}function we(t){return(t%360+360)%360}function ke(t){const e=fe.exec(t);let i,s=255;if(!e)return;e[5]!==i&&(s=e[6]?ne(+e[5]):ae(+e[5]));const o=we(+e[2]),n=+e[3]/100,a=+e[4]/100;return i="hwb"===e[1]?function(t,e,i){return _e(xe,t,e,i)}(o,n,a):"hsv"===e[1]?function(t,e,i){return _e(be,t,e,i)}(o,n,a):ye(o,n,a),{r:i[0],g:i[1],b:i[2],a:s}}const Ce={x:"dark",Z:"light",Y:"re",X:"blu",W:"gr",V:"medium",U:"slate",A:"ee",T:"ol",S:"or",B:"ra",C:"lateg",D:"ights",R:"in",Q:"turquois",E:"hi",P:"ro",O:"al",N:"le",M:"de",L:"yello",F:"en",K:"ch",G:"arks",H:"ea",I:"ightg",J:"wh"},Me={OiceXe:"f0f8ff",antiquewEte:"faebd7",aqua:"ffff",aquamarRe:"7fffd4",azuY:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"0",blanKedOmond:"ffebcd",Xe:"ff",XeviTet:"8a2be2",bPwn:"a52a2a",burlywood:"deb887",caMtXe:"5f9ea0",KartYuse:"7fff00",KocTate:"d2691e",cSO:"ff7f50",cSnflowerXe:"6495ed",cSnsilk:"fff8dc",crimson:"dc143c",cyan:"ffff",xXe:"8b",xcyan:"8b8b",xgTMnPd:"b8860b",xWay:"a9a9a9",xgYF:"6400",xgYy:"a9a9a9",xkhaki:"bdb76b",xmagFta:"8b008b",xTivegYF:"556b2f",xSange:"ff8c00",xScEd:"9932cc",xYd:"8b0000",xsOmon:"e9967a",xsHgYF:"8fbc8f",xUXe:"483d8b",xUWay:"2f4f4f",xUgYy:"2f4f4f",xQe:"ced1",xviTet:"9400d3",dAppRk:"ff1493",dApskyXe:"bfff",dimWay:"696969",dimgYy:"696969",dodgerXe:"1e90ff",fiYbrick:"b22222",flSOwEte:"fffaf0",foYstWAn:"228b22",fuKsia:"ff00ff",gaRsbSo:"dcdcdc",ghostwEte:"f8f8ff",gTd:"ffd700",gTMnPd:"daa520",Way:"808080",gYF:"8000",gYFLw:"adff2f",gYy:"808080",honeyMw:"f0fff0",hotpRk:"ff69b4",RdianYd:"cd5c5c",Rdigo:"4b0082",ivSy:"fffff0",khaki:"f0e68c",lavFMr:"e6e6fa",lavFMrXsh:"fff0f5",lawngYF:"7cfc00",NmoncEffon:"fffacd",ZXe:"add8e6",ZcSO:"f08080",Zcyan:"e0ffff",ZgTMnPdLw:"fafad2",ZWay:"d3d3d3",ZgYF:"90ee90",ZgYy:"d3d3d3",ZpRk:"ffb6c1",ZsOmon:"ffa07a",ZsHgYF:"20b2aa",ZskyXe:"87cefa",ZUWay:"778899",ZUgYy:"778899",ZstAlXe:"b0c4de",ZLw:"ffffe0",lime:"ff00",limegYF:"32cd32",lRF:"faf0e6",magFta:"ff00ff",maPon:"800000",VaquamarRe:"66cdaa",VXe:"cd",VScEd:"ba55d3",VpurpN:"9370db",VsHgYF:"3cb371",VUXe:"7b68ee",VsprRggYF:"fa9a",VQe:"48d1cc",VviTetYd:"c71585",midnightXe:"191970",mRtcYam:"f5fffa",mistyPse:"ffe4e1",moccasR:"ffe4b5",navajowEte:"ffdead",navy:"80",Tdlace:"fdf5e6",Tive:"808000",TivedBb:"6b8e23",Sange:"ffa500",SangeYd:"ff4500",ScEd:"da70d6",pOegTMnPd:"eee8aa",pOegYF:"98fb98",pOeQe:"afeeee",pOeviTetYd:"db7093",papayawEp:"ffefd5",pHKpuff:"ffdab9",peru:"cd853f",pRk:"ffc0cb",plum:"dda0dd",powMrXe:"b0e0e6",purpN:"800080",YbeccapurpN:"663399",Yd:"ff0000",Psybrown:"bc8f8f",PyOXe:"4169e1",saddNbPwn:"8b4513",sOmon:"fa8072",sandybPwn:"f4a460",sHgYF:"2e8b57",sHshell:"fff5ee",siFna:"a0522d",silver:"c0c0c0",skyXe:"87ceeb",UXe:"6a5acd",UWay:"708090",UgYy:"708090",snow:"fffafa",sprRggYF:"ff7f",stAlXe:"4682b4",tan:"d2b48c",teO:"8080",tEstN:"d8bfd8",tomato:"ff6347",Qe:"40e0d0",viTet:"ee82ee",JHt:"f5deb3",wEte:"ffffff",wEtesmoke:"f5f5f5",Lw:"ffff00",LwgYF:"9acd32"};let Se;function Pe(t){Se||(Se=function(){const t={},e=Object.keys(Me),i=Object.keys(Ce);let s,o,n,a,r;for(s=0;s<e.length;s++){for(a=r=e[s],o=0;o<i.length;o++)n=i[o],r=r.replace(n,Ce[n]);n=parseInt(Me[a],16),t[r]=[n>>16&255,n>>8&255,255&n]}return t}(),Se.transparent=[0,0,0,0]);const e=Se[t.toLowerCase()];return e&&{r:e[0],g:e[1],b:e[2],a:4===e.length?e[3]:255}}const Ae=/^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;const Ee=t=>t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055,$e=t=>t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4);function De(t,e,i){if(t){let s=ve(t);s[e]=Math.max(0,Math.min(s[e]+s[e]*i,0===e?360:1)),s=ye(s),t.r=s[0],t.g=s[1],t.b=s[2]}}function Oe(t,e){return t?Object.assign(e||{},t):t}function Te(t){var e={r:0,g:0,b:0,a:255};return Array.isArray(t)?t.length>=3&&(e={r:t[0],g:t[1],b:t[2],a:255},t.length>3&&(e.a=ae(t[3]))):(e=Oe(t,{r:0,g:0,b:0,a:1})).a=ae(e.a),e}function Le(t){return"r"===t.charAt(0)?function(t){const e=Ae.exec(t);let i,s,o,n=255;if(e){if(e[7]!==i){const t=+e[7];n=e[8]?ne(t):oe(255*t,0,255)}return i=+e[1],s=+e[3],o=+e[5],i=255&(e[2]?ne(i):oe(i,0,255)),s=255&(e[4]?ne(s):oe(s,0,255)),o=255&(e[6]?ne(o):oe(o,0,255)),{r:i,g:s,b:o,a:n}}}(t):ke(t)}class Re{constructor(t){if(t instanceof Re)return t;const e=typeof t;let i;var s,o,n;"object"===e?i=Te(t):"string"===e&&(n=(s=t).length,"#"===s[0]&&(4===n||5===n?o={r:255&17*he[s[1]],g:255&17*he[s[2]],b:255&17*he[s[3]],a:5===n?17*he[s[4]]:255}:7!==n&&9!==n||(o={r:he[s[1]]<<4|he[s[2]],g:he[s[3]]<<4|he[s[4]],b:he[s[5]]<<4|he[s[6]],a:9===n?he[s[7]]<<4|he[s[8]]:255})),i=o||Pe(t)||Le(t)),this._rgb=i,this._valid=!!i}get valid(){return this._valid}get rgb(){var t=Oe(this._rgb);return t&&(t.a=re(t.a)),t}set rgb(t){this._rgb=Te(t)}rgbString(){return this._valid?(t=this._rgb)&&(t.a<255?`rgba(${t.r}, ${t.g}, ${t.b}, ${re(t.a)})`:`rgb(${t.r}, ${t.g}, ${t.b})`):void 0;var t}hexString(){return this._valid?ge(this._rgb):void 0}hslString(){return this._valid?function(t){if(!t)return;const e=ve(t),i=e[0],s=le(e[1]),o=le(e[2]);return t.a<255?`hsla(${i}, ${s}%, ${o}%, ${re(t.a)})`:`hsl(${i}, ${s}%, ${o}%)`}(this._rgb):void 0}mix(t,e){if(t){const i=this.rgb,s=t.rgb;let o;const n=e===o?.5:e,a=2*n-1,r=i.a-s.a,l=((a*r===-1?a:(a+r)/(1+a*r))+1)/2;o=1-l,i.r=255&l*i.r+o*s.r+.5,i.g=255&l*i.g+o*s.g+.5,i.b=255&l*i.b+o*s.b+.5,i.a=n*i.a+(1-n)*s.a,this.rgb=i}return this}interpolate(t,e){return t&&(this._rgb=function(t,e,i){const s=$e(re(t.r)),o=$e(re(t.g)),n=$e(re(t.b));return{r:ae(Ee(s+i*($e(re(e.r))-s))),g:ae(Ee(o+i*($e(re(e.g))-o))),b:ae(Ee(n+i*($e(re(e.b))-n))),a:t.a+i*(e.a-t.a)}}(this._rgb,t._rgb,e)),this}clone(){return new Re(this.rgb)}alpha(t){return this._rgb.a=ae(t),this}clearer(t){return this._rgb.a*=1-t,this}greyscale(){const t=this._rgb,e=se(.3*t.r+.59*t.g+.11*t.b);return t.r=t.g=t.b=e,this}opaquer(t){return this._rgb.a*=1+t,this}negate(){const t=this._rgb;return t.r=255-t.r,t.g=255-t.g,t.b=255-t.b,this}lighten(t){return De(this._rgb,2,t),this}darken(t){return De(this._rgb,2,-t),this}saturate(t){return De(this._rgb,1,t),this}desaturate(t){return De(this._rgb,1,-t),this}rotate(t){return function(t,e){var i=ve(t);i[0]=we(i[0]+e),i=ye(i),t.r=i[0],t.g=i[1],t.b=i[2]}(this._rgb,t),this}}function ze(){}const Ie=(()=>{let t=0;return()=>t++})();function Fe(t){return null==t}function Ve(t){if(Array.isArray&&Array.isArray(t))return!0;const e=Object.prototype.toString.call(t);return"[object"===e.slice(0,7)&&"Array]"===e.slice(-6)}function He(t){return null!==t&&"[object Object]"===Object.prototype.toString.call(t)}function Ne(t){return("number"==typeof t||t instanceof Number)&&isFinite(+t)}function Be(t,e){return Ne(t)?t:e}function We(t,e){return void 0===t?e:t}const je=(t,e)=>"string"==typeof t&&t.endsWith("%")?parseFloat(t)/100*e:+t;function Ue(t,e,i){if(t&&"function"==typeof t.call)return t.apply(i,e)}function Ye(t,e,i,s){let o,n,a;if(Ve(t))for(n=t.length,o=0;o<n;o++)e.call(i,t[o],o);else if(He(t))for(a=Object.keys(t),n=a.length,o=0;o<n;o++)e.call(i,t[a[o]],a[o])}function Xe(t,e){let i,s,o,n;if(!t||!e||t.length!==e.length)return!1;for(i=0,s=t.length;i<s;++i)if(o=t[i],n=e[i],o.datasetIndex!==n.datasetIndex||o.index!==n.index)return!1;return!0}function qe(t){if(Ve(t))return t.map(qe);if(He(t)){const e=Object.create(null),i=Object.keys(t),s=i.length;let o=0;for(;o<s;++o)e[i[o]]=qe(t[i[o]]);return e}return t}function Ge(t){return-1===["__proto__","prototype","constructor"].indexOf(t)}function Ke(t,e,i,s){if(!Ge(t))return;const o=e[t],n=i[t];He(o)&&He(n)?Je(o,n,s):e[t]=qe(n)}function Je(t,e,i){const s=Ve(e)?e:[e],o=s.length;if(!He(t))return t;const n=(i=i||{}).merger||Ke;let a;for(let r=0;r<o;++r){if(a=s[r],!He(a))continue;const e=Object.keys(a);for(let s=0,o=e.length;s<o;++s)n(e[s],t,a,i)}return t}function Ze(t,e){return Je(t,e,{merger:Qe})}function Qe(t,e,i){if(!Ge(t))return;const s=e[t],o=i[t];He(s)&&He(o)?Ze(s,o):Object.prototype.hasOwnProperty.call(e,t)||(e[t]=qe(o))}const ti={"":t=>t,x:t=>t.x,y:t=>t.y};function ei(t,e){const i=ti[e]||(ti[e]=function(t){const e=function(t){const e=t.split("."),i=[];let s="";for(const o of e)s+=o,s.endsWith("\\")?s=s.slice(0,-1)+".":(i.push(s),s="");return i}(t);return t=>{for(const i of e){if(""===i)break;t=t&&t[i]}return t}}(e));return i(t)}function ii(t){return t.charAt(0).toUpperCase()+t.slice(1)}const si=t=>void 0!==t,oi=t=>"function"==typeof t,ni=(t,e)=>{if(t.size!==e.size)return!1;for(const i of t)if(!e.has(i))return!1;return!0};const ai=Math.PI,ri=2*ai,li=ri+ai,hi=Number.POSITIVE_INFINITY,ci=ai/180,di=ai/2,ui=ai/4,pi=2*ai/3,gi=Math.log10,fi=Math.sign;function mi(t,e,i){return Math.abs(t-e)<i}function bi(t){const e=Math.round(t);t=mi(t,e,t/1e3)?e:t;const i=Math.pow(10,Math.floor(gi(t))),s=t/i;return(s<=1?1:s<=2?2:s<=5?5:10)*i}function xi(t){return!function(t){return"symbol"==typeof t||"object"==typeof t&&null!==t&&!(Symbol.toPrimitive in t||"toString"in t||"valueOf"in t)}(t)&&!isNaN(parseFloat(t))&&isFinite(t)}function vi(t,e,i){let s,o,n;for(s=0,o=t.length;s<o;s++)n=t[s][i],isNaN(n)||(e.min=Math.min(e.min,n),e.max=Math.max(e.max,n))}function _i(t){return t*(ai/180)}function yi(t){return t*(180/ai)}function wi(t){if(!Ne(t))return;let e=1,i=0;for(;Math.round(t*e)/e!==t;)e*=10,i++;return i}function ki(t,e){const i=e.x-t.x,s=e.y-t.y,o=Math.sqrt(i*i+s*s);let n=Math.atan2(s,i);return n<-.5*ai&&(n+=ri),{angle:n,distance:o}}function Ci(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function Mi(t,e){return(t-e+li)%ri-ai}function Si(t){return(t%ri+ri)%ri}function Pi(t,e,i,s){const o=Si(t),n=Si(e),a=Si(i),r=Si(n-o),l=Si(a-o),h=Si(o-n),c=Si(o-a);return o===n||o===a||s&&n===a||r>l&&h<c}function Ai(t,e,i){return Math.max(e,Math.min(i,t))}function Ei(t,e,i,s=1e-6){return t>=Math.min(e,i)-s&&t<=Math.max(e,i)+s}function $i(t,e,i){i=i||(i=>t[i]<e);let s,o=t.length-1,n=0;for(;o-n>1;)s=n+o>>1,i(s)?n=s:o=s;return{lo:n,hi:o}}const Di=(t,e,i,s)=>$i(t,i,s?s=>{const o=t[s][e];return o<i||o===i&&t[s+1][e]===i}:s=>t[s][e]<i),Oi=(t,e,i)=>$i(t,i,s=>t[s][e]>=i);const Ti=["push","pop","shift","splice","unshift"];function Li(t,e){const i=t._chartjs;if(!i)return;const s=i.listeners,o=s.indexOf(e);-1!==o&&s.splice(o,1),s.length>0||(Ti.forEach(e=>{delete t[e]}),delete t._chartjs)}function Ri(t){const e=new Set(t);return e.size===t.length?t:Array.from(e)}const zi="undefined"==typeof window?function(t){return t()}:window.requestAnimationFrame;function Ii(t,e){let i=[],s=!1;return function(...o){i=o,s||(s=!0,zi.call(window,()=>{s=!1,t.apply(e,i)}))}}const Fi=t=>"start"===t?"left":"end"===t?"right":"center",Vi=(t,e,i)=>"start"===t?e:"end"===t?i:(e+i)/2;function Hi(t,e,i){const s=e.length;let o=0,n=s;if(t._sorted){const{iScale:a,vScale:r,_parsed:l}=t,h=t.dataset&&t.dataset.options?t.dataset.options.spanGaps:null,c=a.axis,{min:d,max:u,minDefined:p,maxDefined:g}=a.getUserBounds();if(p){if(o=Math.min(Di(l,c,d).lo,i?s:Di(e,c,a.getPixelForValue(d)).lo),h){const t=l.slice(0,o+1).reverse().findIndex(t=>!Fe(t[r.axis]));o-=Math.max(0,t)}o=Ai(o,0,s-1)}if(g){let t=Math.max(Di(l,a.axis,u,!0).hi+1,i?0:Di(e,c,a.getPixelForValue(u),!0).hi+1);if(h){const e=l.slice(t-1).findIndex(t=>!Fe(t[r.axis]));t+=Math.max(0,e)}n=Ai(t,o,s)-o}else n=s-o}return{start:o,count:n}}function Ni(t){const{xScale:e,yScale:i,_scaleRanges:s}=t,o={xmin:e.min,xmax:e.max,ymin:i.min,ymax:i.max};if(!s)return t._scaleRanges=o,!0;const n=s.xmin!==e.min||s.xmax!==e.max||s.ymin!==i.min||s.ymax!==i.max;return Object.assign(s,o),n}const Bi=t=>0===t||1===t,Wi=(t,e,i)=>-Math.pow(2,10*(t-=1))*Math.sin((t-e)*ri/i),ji=(t,e,i)=>Math.pow(2,-10*t)*Math.sin((t-e)*ri/i)+1,Ui={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>-t*(t-2),easeInOutQuad:t=>(t/=.5)<1?.5*t*t:-.5*(--t*(t-2)-1),easeInCubic:t=>t*t*t,easeOutCubic:t=>(t-=1)*t*t+1,easeInOutCubic:t=>(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2),easeInQuart:t=>t*t*t*t,easeOutQuart:t=>-((t-=1)*t*t*t-1),easeInOutQuart:t=>(t/=.5)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2),easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>(t-=1)*t*t*t*t+1,easeInOutQuint:t=>(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2),easeInSine:t=>1-Math.cos(t*di),easeOutSine:t=>Math.sin(t*di),easeInOutSine:t=>-.5*(Math.cos(ai*t)-1),easeInExpo:t=>0===t?0:Math.pow(2,10*(t-1)),easeOutExpo:t=>1===t?1:1-Math.pow(2,-10*t),easeInOutExpo:t=>Bi(t)?t:t<.5?.5*Math.pow(2,10*(2*t-1)):.5*(2-Math.pow(2,-10*(2*t-1))),easeInCirc:t=>t>=1?t:-(Math.sqrt(1-t*t)-1),easeOutCirc:t=>Math.sqrt(1-(t-=1)*t),easeInOutCirc:t=>(t/=.5)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1),easeInElastic:t=>Bi(t)?t:Wi(t,.075,.3),easeOutElastic:t=>Bi(t)?t:ji(t,.075,.3),easeInOutElastic(t){const e=.1125;return Bi(t)?t:t<.5?.5*Wi(2*t,e,.45):.5+.5*ji(2*t-1,e,.45)},easeInBack(t){const e=1.70158;return t*t*((e+1)*t-e)},easeOutBack(t){const e=1.70158;return(t-=1)*t*((e+1)*t+e)+1},easeInOutBack(t){let e=1.70158;return(t/=.5)<1?t*t*((1+(e*=1.525))*t-e)*.5:.5*((t-=2)*t*((1+(e*=1.525))*t+e)+2)},easeInBounce:t=>1-Ui.easeOutBounce(1-t),easeOutBounce(t){const e=7.5625,i=2.75;return t<1/i?e*t*t:t<2/i?e*(t-=1.5/i)*t+.75:t<2.5/i?e*(t-=2.25/i)*t+.9375:e*(t-=2.625/i)*t+.984375},easeInOutBounce:t=>t<.5?.5*Ui.easeInBounce(2*t):.5*Ui.easeOutBounce(2*t-1)+.5};function Yi(t){if(t&&"object"==typeof t){const e=t.toString();return"[object CanvasPattern]"===e||"[object CanvasGradient]"===e}return!1}function Xi(t){return Yi(t)?t:new Re(t)}function qi(t){return Yi(t)?t:new Re(t).saturate(.5).darken(.1).hexString()}const Gi=["x","y","borderWidth","radius","tension"],Ki=["color","borderColor","backgroundColor"];const Ji=new Map;function Zi(t,e,i){return function(t,e){e=e||{};const i=t+JSON.stringify(e);let s=Ji.get(i);return s||(s=new Intl.NumberFormat(t,e),Ji.set(i,s)),s}(e,i).format(t)}const Qi={values:t=>Ve(t)?t:""+t,numeric(t,e,i){if(0===t)return"0";const s=this.chart.options.locale;let o,n=t;if(i.length>1){const e=Math.max(Math.abs(i[0].value),Math.abs(i[i.length-1].value));(e<1e-4||e>1e15)&&(o="scientific"),n=function(t,e){let i=e.length>3?e[2].value-e[1].value:e[1].value-e[0].value;Math.abs(i)>=1&&t!==Math.floor(t)&&(i=t-Math.floor(t));return i}(t,i)}const a=gi(Math.abs(n)),r=isNaN(a)?1:Math.max(Math.min(-1*Math.floor(a),20),0),l={notation:o,minimumFractionDigits:r,maximumFractionDigits:r};return Object.assign(l,this.options.ticks.format),Zi(t,s,l)},logarithmic(t,e,i){if(0===t)return"0";const s=i[e].significand||t/Math.pow(10,Math.floor(gi(t)));return[1,2,3,5,10,15].includes(s)||e>.8*i.length?Qi.numeric.call(this,t,e,i):""}};var ts={formatters:Qi};const es=Object.create(null),is=Object.create(null);function ss(t,e){if(!e)return t;const i=e.split(".");for(let s=0,o=i.length;s<o;++s){const e=i[s];t=t[e]||(t[e]=Object.create(null))}return t}function os(t,e,i){return"string"==typeof e?Je(ss(t,e),i):Je(ss(t,""),e)}class ns{constructor(t,e){this.animation=void 0,this.backgroundColor="rgba(0,0,0,0.1)",this.borderColor="rgba(0,0,0,0.1)",this.color="#666",this.datasets={},this.devicePixelRatio=t=>t.chart.platform.getDevicePixelRatio(),this.elements={},this.events=["mousemove","mouseout","click","touchstart","touchmove"],this.font={family:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",size:12,style:"normal",lineHeight:1.2,weight:null},this.hover={},this.hoverBackgroundColor=(t,e)=>qi(e.backgroundColor),this.hoverBorderColor=(t,e)=>qi(e.borderColor),this.hoverColor=(t,e)=>qi(e.color),this.indexAxis="x",this.interaction={mode:"nearest",intersect:!0,includeInvisible:!1},this.maintainAspectRatio=!0,this.onHover=null,this.onClick=null,this.parsing=!0,this.plugins={},this.responsive=!0,this.scale=void 0,this.scales={},this.showLine=!0,this.drawActiveElementsOnTop=!0,this.describe(t),this.apply(e)}set(t,e){return os(this,t,e)}get(t){return ss(this,t)}describe(t,e){return os(is,t,e)}override(t,e){return os(es,t,e)}route(t,e,i,s){const o=ss(this,t),n=ss(this,i),a="_"+e;Object.defineProperties(o,{[a]:{value:o[e],writable:!0},[e]:{enumerable:!0,get(){const t=this[a],e=n[s];return He(t)?Object.assign({},e,t):We(t,e)},set(t){this[a]=t}}})}apply(t){t.forEach(t=>t(this))}}var as=new ns({_scriptable:t=>!t.startsWith("on"),_indexable:t=>"events"!==t,hover:{_fallback:"interaction"},interaction:{_scriptable:!1,_indexable:!1}},[function(t){t.set("animation",{delay:void 0,duration:1e3,easing:"easeOutQuart",fn:void 0,from:void 0,loop:void 0,to:void 0,type:void 0}),t.describe("animation",{_fallback:!1,_indexable:!1,_scriptable:t=>"onProgress"!==t&&"onComplete"!==t&&"fn"!==t}),t.set("animations",{colors:{type:"color",properties:Ki},numbers:{type:"number",properties:Gi}}),t.describe("animations",{_fallback:"animation"}),t.set("transitions",{active:{animation:{duration:400}},resize:{animation:{duration:0}},show:{animations:{colors:{from:"transparent"},visible:{type:"boolean",duration:0}}},hide:{animations:{colors:{to:"transparent"},visible:{type:"boolean",easing:"linear",fn:t=>0|t}}}})},function(t){t.set("layout",{autoPadding:!0,padding:{top:0,right:0,bottom:0,left:0}})},function(t){t.set("scale",{display:!0,offset:!1,reverse:!1,beginAtZero:!1,bounds:"ticks",clip:!0,grace:0,grid:{display:!0,lineWidth:1,drawOnChartArea:!0,drawTicks:!0,tickLength:8,tickWidth:(t,e)=>e.lineWidth,tickColor:(t,e)=>e.color,offset:!1},border:{display:!0,dash:[],dashOffset:0,width:1},title:{display:!1,text:"",padding:{top:4,bottom:4}},ticks:{minRotation:0,maxRotation:50,mirror:!1,textStrokeWidth:0,textStrokeColor:"",padding:3,display:!0,autoSkip:!0,autoSkipPadding:3,labelOffset:0,callback:ts.formatters.values,minor:{},major:{},align:"center",crossAlign:"near",showLabelBackdrop:!1,backdropColor:"rgba(255, 255, 255, 0.75)",backdropPadding:2}}),t.route("scale.ticks","color","","color"),t.route("scale.grid","color","","borderColor"),t.route("scale.border","color","","borderColor"),t.route("scale.title","color","","color"),t.describe("scale",{_fallback:!1,_scriptable:t=>!t.startsWith("before")&&!t.startsWith("after")&&"callback"!==t&&"parser"!==t,_indexable:t=>"borderDash"!==t&&"tickBorderDash"!==t&&"dash"!==t}),t.describe("scales",{_fallback:"scale"}),t.describe("scale.ticks",{_scriptable:t=>"backdropPadding"!==t&&"callback"!==t,_indexable:t=>"backdropPadding"!==t})}]);function rs(t,e,i,s,o){let n=e[o];return n||(n=e[o]=t.measureText(o).width,i.push(o)),n>s&&(s=n),s}function ls(t,e,i,s){let o=(s=s||{}).data=s.data||{},n=s.garbageCollect=s.garbageCollect||[];s.font!==e&&(o=s.data={},n=s.garbageCollect=[],s.font=e),t.save(),t.font=e;let a=0;const r=i.length;let l,h,c,d,u;for(l=0;l<r;l++)if(d=i[l],null==d||Ve(d)){if(Ve(d))for(h=0,c=d.length;h<c;h++)u=d[h],null==u||Ve(u)||(a=rs(t,o,n,a,u))}else a=rs(t,o,n,a,d);t.restore();const p=n.length/2;if(p>i.length){for(l=0;l<p;l++)delete o[n[l]];n.splice(0,p)}return a}function hs(t,e,i){const s=t.currentDevicePixelRatio,o=0!==i?Math.max(i/2,.5):0;return Math.round((e-o)*s)/s+o}function cs(t,e){(e||t)&&((e=e||t.getContext("2d")).save(),e.resetTransform(),e.clearRect(0,0,t.width,t.height),e.restore())}function ds(t,e,i,s){us(t,e,i,s,null)}function us(t,e,i,s,o){let n,a,r,l,h,c,d,u;const p=e.pointStyle,g=e.rotation,f=e.radius;let m=(g||0)*ci;if(p&&"object"==typeof p&&(n=p.toString(),"[object HTMLImageElement]"===n||"[object HTMLCanvasElement]"===n))return t.save(),t.translate(i,s),t.rotate(m),t.drawImage(p,-p.width/2,-p.height/2,p.width,p.height),void t.restore();if(!(isNaN(f)||f<=0)){switch(t.beginPath(),p){default:o?t.ellipse(i,s,o/2,f,0,0,ri):t.arc(i,s,f,0,ri),t.closePath();break;case"triangle":c=o?o/2:f,t.moveTo(i+Math.sin(m)*c,s-Math.cos(m)*f),m+=pi,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*f),m+=pi,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*f),t.closePath();break;case"rectRounded":h=.516*f,l=f-h,a=Math.cos(m+ui)*l,d=Math.cos(m+ui)*(o?o/2-h:l),r=Math.sin(m+ui)*l,u=Math.sin(m+ui)*(o?o/2-h:l),t.arc(i-d,s-r,h,m-ai,m-di),t.arc(i+u,s-a,h,m-di,m),t.arc(i+d,s+r,h,m,m+di),t.arc(i-u,s+a,h,m+di,m+ai),t.closePath();break;case"rect":if(!g){l=Math.SQRT1_2*f,c=o?o/2:l,t.rect(i-c,s-l,2*c,2*l);break}m+=ui;case"rectRot":d=Math.cos(m)*(o?o/2:f),a=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(o?o/2:f),t.moveTo(i-d,s-r),t.lineTo(i+u,s-a),t.lineTo(i+d,s+r),t.lineTo(i-u,s+a),t.closePath();break;case"crossRot":m+=ui;case"cross":d=Math.cos(m)*(o?o/2:f),a=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(o?o/2:f),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"star":d=Math.cos(m)*(o?o/2:f),a=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(o?o/2:f),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a),m+=ui,d=Math.cos(m)*(o?o/2:f),a=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(o?o/2:f),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case"line":a=o?o/2:Math.cos(m)*f,r=Math.sin(m)*f,t.moveTo(i-a,s-r),t.lineTo(i+a,s+r);break;case"dash":t.moveTo(i,s),t.lineTo(i+Math.cos(m)*(o?o/2:f),s+Math.sin(m)*f);break;case!1:t.closePath()}t.fill(),e.borderWidth>0&&t.stroke()}}function ps(t,e,i){return i=i||.5,!e||t&&t.x>e.left-i&&t.x<e.right+i&&t.y>e.top-i&&t.y<e.bottom+i}function gs(t,e){t.save(),t.beginPath(),t.rect(e.left,e.top,e.right-e.left,e.bottom-e.top),t.clip()}function fs(t){t.restore()}function ms(t,e,i,s,o){if(!e)return t.lineTo(i.x,i.y);if("middle"===o){const s=(e.x+i.x)/2;t.lineTo(s,e.y),t.lineTo(s,i.y)}else"after"===o!=!!s?t.lineTo(e.x,i.y):t.lineTo(i.x,e.y);t.lineTo(i.x,i.y)}function bs(t,e,i,s){if(!e)return t.lineTo(i.x,i.y);t.bezierCurveTo(s?e.cp1x:e.cp2x,s?e.cp1y:e.cp2y,s?i.cp2x:i.cp1x,s?i.cp2y:i.cp1y,i.x,i.y)}function xs(t,e,i,s,o){if(o.strikethrough||o.underline){const n=t.measureText(s),a=e-n.actualBoundingBoxLeft,r=e+n.actualBoundingBoxRight,l=i-n.actualBoundingBoxAscent,h=i+n.actualBoundingBoxDescent,c=o.strikethrough?(l+h)/2:h;t.strokeStyle=t.fillStyle,t.beginPath(),t.lineWidth=o.decorationWidth||2,t.moveTo(a,c),t.lineTo(r,c),t.stroke()}}function vs(t,e){const i=t.fillStyle;t.fillStyle=e.color,t.fillRect(e.left,e.top,e.width,e.height),t.fillStyle=i}function _s(t,e,i,s,o,n={}){const a=Ve(e)?e:[e],r=n.strokeWidth>0&&""!==n.strokeColor;let l,h;for(t.save(),t.font=o.string,function(t,e){e.translation&&t.translate(e.translation[0],e.translation[1]),Fe(e.rotation)||t.rotate(e.rotation),e.color&&(t.fillStyle=e.color),e.textAlign&&(t.textAlign=e.textAlign),e.textBaseline&&(t.textBaseline=e.textBaseline)}(t,n),l=0;l<a.length;++l)h=a[l],n.backdrop&&vs(t,n.backdrop),r&&(n.strokeColor&&(t.strokeStyle=n.strokeColor),Fe(n.strokeWidth)||(t.lineWidth=n.strokeWidth),t.strokeText(h,i,s,n.maxWidth)),t.fillText(h,i,s,n.maxWidth),xs(t,i,s,h,n),s+=Number(o.lineHeight);t.restore()}function ys(t,e){const{x:i,y:s,w:o,h:n,radius:a}=e;t.arc(i+a.topLeft,s+a.topLeft,a.topLeft,1.5*ai,ai,!0),t.lineTo(i,s+n-a.bottomLeft),t.arc(i+a.bottomLeft,s+n-a.bottomLeft,a.bottomLeft,ai,di,!0),t.lineTo(i+o-a.bottomRight,s+n),t.arc(i+o-a.bottomRight,s+n-a.bottomRight,a.bottomRight,di,0,!0),t.lineTo(i+o,s+a.topRight),t.arc(i+o-a.topRight,s+a.topRight,a.topRight,0,-di,!0),t.lineTo(i+a.topLeft,s)}const ws=/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/,ks=/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;function Cs(t,e){const i=(""+t).match(ws);if(!i||"normal"===i[1])return 1.2*e;switch(t=+i[2],i[3]){case"px":return t;case"%":t/=100}return e*t}const Ms=t=>+t||0;function Ss(t,e){const i={},s=He(e),o=s?Object.keys(e):e,n=He(t)?s?i=>We(t[i],t[e[i]]):e=>t[e]:()=>t;for(const a of o)i[a]=Ms(n(a));return i}function Ps(t){return Ss(t,{top:"y",right:"x",bottom:"y",left:"x"})}function As(t){return Ss(t,["topLeft","topRight","bottomLeft","bottomRight"])}function Es(t){const e=Ps(t);return e.width=e.left+e.right,e.height=e.top+e.bottom,e}function $s(t,e){t=t||{},e=e||as.font;let i=We(t.size,e.size);"string"==typeof i&&(i=parseInt(i,10));let s=We(t.style,e.style);s&&!(""+s).match(ks)&&(console.warn('Invalid font style specified: "'+s+'"'),s=void 0);const o={family:We(t.family,e.family),lineHeight:Cs(We(t.lineHeight,e.lineHeight),i),size:i,style:s,weight:We(t.weight,e.weight),string:""};return o.string=function(t){return!t||Fe(t.size)||Fe(t.family)?null:(t.style?t.style+" ":"")+(t.weight?t.weight+" ":"")+t.size+"px "+t.family}(o),o}function Ds(t,e,i,s){let o,n,a;for(o=0,n=t.length;o<n;++o)if(a=t[o],void 0!==a&&void 0!==a)return a}function Os(t,e){return Object.assign(Object.create(t),e)}function Ts(t,e=[""],i,s,o=()=>t[0]){const n=i||t;void 0===s&&(s=js("_fallback",t));const a={[Symbol.toStringTag]:"Object",_cacheable:!0,_scopes:t,_rootScopes:n,_fallback:s,_getTarget:o,override:i=>Ts([i,...t],e,n,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete e._keys,delete t[0][i],!0),get:(i,s)=>Fs(i,s,()=>function(t,e,i,s){let o;for(const n of e)if(o=js(zs(n,t),i),void 0!==o)return Is(t,o)?Bs(i,s,t,o):o}(s,e,t,i)),getOwnPropertyDescriptor:(t,e)=>Reflect.getOwnPropertyDescriptor(t._scopes[0],e),getPrototypeOf:()=>Reflect.getPrototypeOf(t[0]),has:(t,e)=>Us(t).includes(e),ownKeys:t=>Us(t),set(t,e,i){const s=t._storage||(t._storage=o());return t[e]=s[e]=i,delete t._keys,!0}})}function Ls(t,e,i,s){const o={_cacheable:!1,_proxy:t,_context:e,_subProxy:i,_stack:new Set,_descriptors:Rs(t,s),setContext:e=>Ls(t,e,i,s),override:o=>Ls(t.override(o),e,i,s)};return new Proxy(o,{deleteProperty:(e,i)=>(delete e[i],delete t[i],!0),get:(t,e,i)=>Fs(t,e,()=>function(t,e,i){const{_proxy:s,_context:o,_subProxy:n,_descriptors:a}=t;let r=s[e];oi(r)&&a.isScriptable(e)&&(r=function(t,e,i,s){const{_proxy:o,_context:n,_subProxy:a,_stack:r}=i;if(r.has(t))throw new Error("Recursion detected: "+Array.from(r).join("->")+"->"+t);r.add(t);let l=e(n,a||s);r.delete(t),Is(t,l)&&(l=Bs(o._scopes,o,t,l));return l}(e,r,t,i));Ve(r)&&r.length&&(r=function(t,e,i,s){const{_proxy:o,_context:n,_subProxy:a,_descriptors:r}=i;if(void 0!==n.index&&s(t))return e[n.index%e.length];if(He(e[0])){const i=e,s=o._scopes.filter(t=>t!==i);e=[];for(const l of i){const i=Bs(s,o,t,l);e.push(Ls(i,n,a&&a[t],r))}}return e}(e,r,t,a.isIndexable));Is(e,r)&&(r=Ls(r,o,n&&n[e],a));return r}(t,e,i)),getOwnPropertyDescriptor:(e,i)=>e._descriptors.allKeys?Reflect.has(t,i)?{enumerable:!0,configurable:!0}:void 0:Reflect.getOwnPropertyDescriptor(t,i),getPrototypeOf:()=>Reflect.getPrototypeOf(t),has:(e,i)=>Reflect.has(t,i),ownKeys:()=>Reflect.ownKeys(t),set:(e,i,s)=>(t[i]=s,delete e[i],!0)})}function Rs(t,e={scriptable:!0,indexable:!0}){const{_scriptable:i=e.scriptable,_indexable:s=e.indexable,_allKeys:o=e.allKeys}=t;return{allKeys:o,scriptable:i,indexable:s,isScriptable:oi(i)?i:()=>i,isIndexable:oi(s)?s:()=>s}}const zs=(t,e)=>t?t+ii(e):e,Is=(t,e)=>He(e)&&"adapters"!==t&&(null===Object.getPrototypeOf(e)||e.constructor===Object);function Fs(t,e,i){if(Object.prototype.hasOwnProperty.call(t,e)||"constructor"===e)return t[e];const s=i();return t[e]=s,s}function Vs(t,e,i){return oi(t)?t(e,i):t}const Hs=(t,e)=>!0===t?e:"string"==typeof t?ei(e,t):void 0;function Ns(t,e,i,s,o){for(const n of e){const e=Hs(i,n);if(e){t.add(e);const n=Vs(e._fallback,i,o);if(void 0!==n&&n!==i&&n!==s)return n}else if(!1===e&&void 0!==s&&i!==s)return null}return!1}function Bs(t,e,i,s){const o=e._rootScopes,n=Vs(e._fallback,i,s),a=[...t,...o],r=new Set;r.add(s);let l=Ws(r,a,i,n||i,s);return null!==l&&((void 0===n||n===i||(l=Ws(r,a,n,l,s),null!==l))&&Ts(Array.from(r),[""],o,n,()=>function(t,e,i){const s=t._getTarget();e in s||(s[e]={});const o=s[e];if(Ve(o)&&He(i))return i;return o||{}}(e,i,s)))}function Ws(t,e,i,s,o){for(;i;)i=Ns(t,e,i,s,o);return i}function js(t,e){for(const i of e){if(!i)continue;const e=i[t];if(void 0!==e)return e}}function Us(t){let e=t._keys;return e||(e=t._keys=function(t){const e=new Set;for(const i of t)for(const t of Object.keys(i).filter(t=>!t.startsWith("_")))e.add(t);return Array.from(e)}(t._scopes)),e}function Ys(t,e,i,s){const{iScale:o}=t,{key:n="r"}=this._parsing,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={r:o.parse(ei(c,n),h)};return a}const Xs=Number.EPSILON||1e-14,qs=(t,e)=>e<t.length&&!t[e].skip&&t[e],Gs=t=>"x"===t?"y":"x";function Ks(t,e,i,s){const o=t.skip?e:t,n=e,a=i.skip?e:i,r=Ci(n,o),l=Ci(a,n);let h=r/(r+l),c=l/(r+l);h=isNaN(h)?0:h,c=isNaN(c)?0:c;const d=s*h,u=s*c;return{previous:{x:n.x-d*(a.x-o.x),y:n.y-d*(a.y-o.y)},next:{x:n.x+u*(a.x-o.x),y:n.y+u*(a.y-o.y)}}}function Js(t,e="x"){const i=Gs(e),s=t.length,o=Array(s).fill(0),n=Array(s);let a,r,l,h=qs(t,0);for(a=0;a<s;++a)if(r=l,l=h,h=qs(t,a+1),l){if(h){const t=h[e]-l[e];o[a]=0!==t?(h[i]-l[i])/t:0}n[a]=r?h?fi(o[a-1])!==fi(o[a])?0:(o[a-1]+o[a])/2:o[a-1]:o[a]}!function(t,e,i){const s=t.length;let o,n,a,r,l,h=qs(t,0);for(let c=0;c<s-1;++c)l=h,h=qs(t,c+1),l&&h&&(mi(e[c],0,Xs)?i[c]=i[c+1]=0:(o=i[c]/e[c],n=i[c+1]/e[c],r=Math.pow(o,2)+Math.pow(n,2),r<=9||(a=3/Math.sqrt(r),i[c]=o*a*e[c],i[c+1]=n*a*e[c])))}(t,o,n),function(t,e,i="x"){const s=Gs(i),o=t.length;let n,a,r,l=qs(t,0);for(let h=0;h<o;++h){if(a=r,r=l,l=qs(t,h+1),!r)continue;const o=r[i],c=r[s];a&&(n=(o-a[i])/3,r[`cp1${i}`]=o-n,r[`cp1${s}`]=c-n*e[h]),l&&(n=(l[i]-o)/3,r[`cp2${i}`]=o+n,r[`cp2${s}`]=c+n*e[h])}}(t,n,e)}function Zs(t,e,i){return Math.max(Math.min(t,i),e)}function Qs(t,e,i,s,o){let n,a,r,l;if(e.spanGaps&&(t=t.filter(t=>!t.skip)),"monotone"===e.cubicInterpolationMode)Js(t,o);else{let i=s?t[t.length-1]:t[0];for(n=0,a=t.length;n<a;++n)r=t[n],l=Ks(i,r,t[Math.min(n+1,a-(s?0:1))%a],e.tension),r.cp1x=l.previous.x,r.cp1y=l.previous.y,r.cp2x=l.next.x,r.cp2y=l.next.y,i=r}e.capBezierPoints&&function(t,e){let i,s,o,n,a,r=ps(t[0],e);for(i=0,s=t.length;i<s;++i)a=n,n=r,r=i<s-1&&ps(t[i+1],e),n&&(o=t[i],a&&(o.cp1x=Zs(o.cp1x,e.left,e.right),o.cp1y=Zs(o.cp1y,e.top,e.bottom)),r&&(o.cp2x=Zs(o.cp2x,e.left,e.right),o.cp2y=Zs(o.cp2y,e.top,e.bottom)))}(t,i)}function to(){return"undefined"!=typeof window&&"undefined"!=typeof document}function eo(t){let e=t.parentNode;return e&&"[object ShadowRoot]"===e.toString()&&(e=e.host),e}function io(t,e,i){let s;return"string"==typeof t?(s=parseInt(t,10),-1!==t.indexOf("%")&&(s=s/100*e.parentNode[i])):s=t,s}const so=t=>t.ownerDocument.defaultView.getComputedStyle(t,null);const oo=["top","right","bottom","left"];function no(t,e,i){const s={};i=i?"-"+i:"";for(let o=0;o<4;o++){const n=oo[o];s[n]=parseFloat(t[e+"-"+n+i])||0}return s.width=s.left+s.right,s.height=s.top+s.bottom,s}function ao(t,e){if("native"in t)return t;const{canvas:i,currentDevicePixelRatio:s}=e,o=so(i),n="border-box"===o.boxSizing,a=no(o,"padding"),r=no(o,"border","width"),{x:l,y:h,box:c}=function(t,e){const i=t.touches,s=i&&i.length?i[0]:t,{offsetX:o,offsetY:n}=s;let a,r,l=!1;if(((t,e,i)=>(t>0||e>0)&&(!i||!i.shadowRoot))(o,n,t.target))a=o,r=n;else{const t=e.getBoundingClientRect();a=s.clientX-t.left,r=s.clientY-t.top,l=!0}return{x:a,y:r,box:l}}(t,i),d=a.left+(c&&r.left),u=a.top+(c&&r.top);let{width:p,height:g}=e;return n&&(p-=a.width+r.width,g-=a.height+r.height),{x:Math.round((l-d)/p*i.width/s),y:Math.round((h-u)/g*i.height/s)}}const ro=t=>Math.round(10*t)/10;function lo(t,e,i,s){const o=so(t),n=no(o,"margin"),a=io(o.maxWidth,t,"clientWidth")||hi,r=io(o.maxHeight,t,"clientHeight")||hi,l=function(t,e,i){let s,o;if(void 0===e||void 0===i){const n=t&&eo(t);if(n){const t=n.getBoundingClientRect(),a=so(n),r=no(a,"border","width"),l=no(a,"padding");e=t.width-l.width-r.width,i=t.height-l.height-r.height,s=io(a.maxWidth,n,"clientWidth"),o=io(a.maxHeight,n,"clientHeight")}else e=t.clientWidth,i=t.clientHeight}return{width:e,height:i,maxWidth:s||hi,maxHeight:o||hi}}(t,e,i);let{width:h,height:c}=l;if("content-box"===o.boxSizing){const t=no(o,"border","width"),e=no(o,"padding");h-=e.width+t.width,c-=e.height+t.height}h=Math.max(0,h-n.width),c=Math.max(0,s?h/s:c-n.height),h=ro(Math.min(h,a,l.maxWidth)),c=ro(Math.min(c,r,l.maxHeight)),h&&!c&&(c=ro(h/2));return(void 0!==e||void 0!==i)&&s&&l.height&&c>l.height&&(c=l.height,h=ro(Math.floor(c*s))),{width:h,height:c}}function ho(t,e,i){const s=e||1,o=ro(t.height*s),n=ro(t.width*s);t.height=ro(t.height),t.width=ro(t.width);const a=t.canvas;return a.style&&(i||!a.style.height&&!a.style.width)&&(a.style.height=`${t.height}px`,a.style.width=`${t.width}px`),(t.currentDevicePixelRatio!==s||a.height!==o||a.width!==n)&&(t.currentDevicePixelRatio=s,a.height=o,a.width=n,t.ctx.setTransform(s,0,0,s,0,0),!0)}const co=function(){let t=!1;try{const e={get passive(){return t=!0,!1}};to()&&(window.addEventListener("test",null,e),window.removeEventListener("test",null,e))}catch(e){}return t}();function uo(t,e){const i=function(t,e){return so(t).getPropertyValue(e)}(t,e),s=i&&i.match(/^(\d+)(\.\d+)?px$/);return s?+s[1]:void 0}function po(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:t.y+i*(e.y-t.y)}}function go(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:"middle"===s?i<.5?t.y:e.y:"after"===s?i<1?t.y:e.y:i>0?e.y:t.y}}function fo(t,e,i,s){const o={x:t.cp2x,y:t.cp2y},n={x:e.cp1x,y:e.cp1y},a=po(t,o,i),r=po(o,n,i),l=po(n,e,i),h=po(a,r,i),c=po(r,l,i);return po(h,c,i)}function mo(t,e,i){return t?function(t,e){return{x:i=>t+t+e-i,setWidth(t){e=t},textAlign:t=>"center"===t?t:"right"===t?"left":"right",xPlus:(t,e)=>t-e,leftForLtr:(t,e)=>t-e}}(e,i):{x:t=>t,setWidth(t){},textAlign:t=>t,xPlus:(t,e)=>t+e,leftForLtr:(t,e)=>t}}function bo(t,e){let i,s;"ltr"!==e&&"rtl"!==e||(i=t.canvas.style,s=[i.getPropertyValue("direction"),i.getPropertyPriority("direction")],i.setProperty("direction",e,"important"),t.prevTextDirection=s)}function xo(t,e){void 0!==e&&(delete t.prevTextDirection,t.canvas.style.setProperty("direction",e[0],e[1]))}function vo(t){return"angle"===t?{between:Pi,compare:Mi,normalize:Si}:{between:Ei,compare:(t,e)=>t-e,normalize:t=>t}}function _o({start:t,end:e,count:i,loop:s,style:o}){return{start:t%i,end:e%i,loop:s&&(e-t+1)%i==0,style:o}}function yo(t,e,i){if(!i)return[t];const{property:s,start:o,end:n}=i,a=e.length,{compare:r,between:l,normalize:h}=vo(s),{start:c,end:d,loop:u,style:p}=function(t,e,i){const{property:s,start:o,end:n}=i,{between:a,normalize:r}=vo(s),l=e.length;let h,c,{start:d,end:u,loop:p}=t;if(p){for(d+=l,u+=l,h=0,c=l;h<c&&a(r(e[d%l][s]),o,n);++h)d--,u--;d%=l,u%=l}return u<d&&(u+=l),{start:d,end:u,loop:p,style:t.style}}(t,e,i),g=[];let f,m,b,x=!1,v=null;const _=()=>x||l(o,b,f)&&0!==r(o,b),y=()=>!x||0===r(n,f)||l(n,b,f);for(let w=c,k=c;w<=d;++w)m=e[w%a],m.skip||(f=h(m[s]),f!==b&&(x=l(f,o,n),null===v&&_()&&(v=0===r(f,o)?w:k),null!==v&&y()&&(g.push(_o({start:v,end:w,loop:u,count:a,style:p})),v=null),k=w,b=f));return null!==v&&g.push(_o({start:v,end:d,loop:u,count:a,style:p})),g}function wo(t,e){const i=[],s=t.segments;for(let o=0;o<s.length;o++){const n=yo(s[o],t.points,e);n.length&&i.push(...n)}return i}function ko(t,e,i,s){return s&&s.setContext&&i?function(t,e,i,s){const o=t._chart.getContext(),n=Co(t.options),{_datasetIndex:a,options:{spanGaps:r}}=t,l=i.length,h=[];let c=n,d=e[0].start,u=d;function p(t,e,s,o){const n=r?-1:1;if(t!==e){for(t+=l;i[t%l].skip;)t-=n;for(;i[e%l].skip;)e+=n;t%l!==e%l&&(h.push({start:t%l,end:e%l,loop:s,style:o}),c=o,d=e%l)}}for(const g of e){d=r?d:g.start;let t,e=i[d%l];for(u=d+1;u<=g.end;u++){const n=i[u%l];t=Co(s.setContext(Os(o,{type:"segment",p0:e,p1:n,p0DataIndex:(u-1)%l,p1DataIndex:u%l,datasetIndex:a}))),Mo(t,c)&&p(d,u-1,g.loop,c),e=n,c=t}d<u-1&&p(d,u-1,g.loop,c)}return h}(t,e,i,s):e}function Co(t){return{backgroundColor:t.backgroundColor,borderCapStyle:t.borderCapStyle,borderDash:t.borderDash,borderDashOffset:t.borderDashOffset,borderJoinStyle:t.borderJoinStyle,borderWidth:t.borderWidth,borderColor:t.borderColor}}function Mo(t,e){if(!e)return!1;const i=[],s=function(t,e){return Yi(e)?(i.includes(e)||i.push(e),i.indexOf(e)):e};return JSON.stringify(t,s)!==JSON.stringify(e,s)}function So(t,e,i){return t.options.clip?t[i]:e[i]}function Po(t,e){const i=e._clip;if(i.disabled)return!1;const s=function(t,e){const{xScale:i,yScale:s}=t;return i&&s?{left:So(i,e,"left"),right:So(i,e,"right"),top:So(s,e,"top"),bottom:So(s,e,"bottom")}:e}(e,t.chartArea);return{left:!1===i.left?0:s.left-(!0===i.left?0:i.left),right:!1===i.right?t.width:s.right+(!0===i.right?0:i.right),top:!1===i.top?0:s.top-(!0===i.top?0:i.top),bottom:!1===i.bottom?t.height:s.bottom+(!0===i.bottom?0:i.bottom)}}class Ao{constructor(){this._request=null,this._charts=new Map,this._running=!1,this._lastDate=void 0}_notify(t,e,i,s){const o=e.listeners[s],n=e.duration;o.forEach(s=>s({chart:t,initial:e.initial,numSteps:n,currentStep:Math.min(i-e.start,n)}))}_refresh(){this._request||(this._running=!0,this._request=zi.call(window,()=>{this._update(),this._request=null,this._running&&this._refresh()}))}_update(t=Date.now()){let e=0;this._charts.forEach((i,s)=>{if(!i.running||!i.items.length)return;const o=i.items;let n,a=o.length-1,r=!1;for(;a>=0;--a)n=o[a],n._active?(n._total>i.duration&&(i.duration=n._total),n.tick(t),r=!0):(o[a]=o[o.length-1],o.pop());r&&(s.draw(),this._notify(s,i,t,"progress")),o.length||(i.running=!1,this._notify(s,i,t,"complete"),i.initial=!1),e+=o.length}),this._lastDate=t,0===e&&(this._running=!1)}_getAnims(t){const e=this._charts;let i=e.get(t);return i||(i={running:!1,initial:!0,items:[],listeners:{complete:[],progress:[]}},e.set(t,i)),i}listen(t,e,i){this._getAnims(t).listeners[e].push(i)}add(t,e){e&&e.length&&this._getAnims(t).items.push(...e)}has(t){return this._getAnims(t).items.length>0}start(t){const e=this._charts.get(t);e&&(e.running=!0,e.start=Date.now(),e.duration=e.items.reduce((t,e)=>Math.max(t,e._duration),0),this._refresh())}running(t){if(!this._running)return!1;const e=this._charts.get(t);return!!(e&&e.running&&e.items.length)}stop(t){const e=this._charts.get(t);if(!e||!e.items.length)return;const i=e.items;let s=i.length-1;for(;s>=0;--s)i[s].cancel();e.items=[],this._notify(t,e,Date.now(),"complete")}remove(t){return this._charts.delete(t)}}var Eo=new Ao;const $o="transparent",Do={boolean:(t,e,i)=>i>.5?e:t,color(t,e,i){const s=Xi(t||$o),o=s.valid&&Xi(e||$o);return o&&o.valid?o.mix(s,i).hexString():e},number:(t,e,i)=>t+(e-t)*i};class Oo{constructor(t,e,i,s){const o=e[i];s=Ds([t.to,s,o,t.from]);const n=Ds([t.from,o,s]);this._active=!0,this._fn=t.fn||Do[t.type||typeof n],this._easing=Ui[t.easing]||Ui.linear,this._start=Math.floor(Date.now()+(t.delay||0)),this._duration=this._total=Math.floor(t.duration),this._loop=!!t.loop,this._target=e,this._prop=i,this._from=n,this._to=s,this._promises=void 0}active(){return this._active}update(t,e,i){if(this._active){this._notify(!1);const s=this._target[this._prop],o=i-this._start,n=this._duration-o;this._start=i,this._duration=Math.floor(Math.max(n,t.duration)),this._total+=o,this._loop=!!t.loop,this._to=Ds([t.to,e,s,t.from]),this._from=Ds([t.from,s,e])}}cancel(){this._active&&(this.tick(Date.now()),this._active=!1,this._notify(!1))}tick(t){const e=t-this._start,i=this._duration,s=this._prop,o=this._from,n=this._loop,a=this._to;let r;if(this._active=o!==a&&(n||e<i),!this._active)return this._target[s]=a,void this._notify(!0);e<0?this._target[s]=o:(r=e/i%2,r=n&&r>1?2-r:r,r=this._easing(Math.min(1,Math.max(0,r))),this._target[s]=this._fn(o,a,r))}wait(){const t=this._promises||(this._promises=[]);return new Promise((e,i)=>{t.push({res:e,rej:i})})}_notify(t){const e=t?"res":"rej",i=this._promises||[];for(let s=0;s<i.length;s++)i[s][e]()}}class To{constructor(t,e){this._chart=t,this._properties=new Map,this.configure(e)}configure(t){if(!He(t))return;const e=Object.keys(as.animation),i=this._properties;Object.getOwnPropertyNames(t).forEach(s=>{const o=t[s];if(!He(o))return;const n={};for(const t of e)n[t]=o[t];(Ve(o.properties)&&o.properties||[s]).forEach(t=>{t!==s&&i.has(t)||i.set(t,n)})})}_animateOptions(t,e){const i=e.options,s=function(t,e){if(!e)return;let i=t.options;if(!i)return void(t.options=e);i.$shared&&(t.options=i=Object.assign({},i,{$shared:!1,$animations:{}}));return i}(t,i);if(!s)return[];const o=this._createAnimations(s,i);return i.$shared&&function(t,e){const i=[],s=Object.keys(e);for(let o=0;o<s.length;o++){const e=t[s[o]];e&&e.active()&&i.push(e.wait())}return Promise.all(i)}(t.options.$animations,i).then(()=>{t.options=i},()=>{}),o}_createAnimations(t,e){const i=this._properties,s=[],o=t.$animations||(t.$animations={}),n=Object.keys(e),a=Date.now();let r;for(r=n.length-1;r>=0;--r){const l=n[r];if("$"===l.charAt(0))continue;if("options"===l){s.push(...this._animateOptions(t,e));continue}const h=e[l];let c=o[l];const d=i.get(l);if(c){if(d&&c.active()){c.update(d,h,a);continue}c.cancel()}d&&d.duration?(o[l]=c=new Oo(d,t,l,h),s.push(c)):t[l]=h}return s}update(t,e){if(0===this._properties.size)return void Object.assign(t,e);const i=this._createAnimations(t,e);return i.length?(Eo.add(this._chart,i),!0):void 0}}function Lo(t,e){const i=t&&t.options||{},s=i.reverse,o=void 0===i.min?e:0,n=void 0===i.max?e:0;return{start:s?n:o,end:s?o:n}}function Ro(t,e){const i=[],s=t._getSortedDatasetMetas(e);let o,n;for(o=0,n=s.length;o<n;++o)i.push(s[o].index);return i}function zo(t,e,i,s={}){const o=t.keys,n="single"===s.mode;let a,r,l,h;if(null===e)return;let c=!1;for(a=0,r=o.length;a<r;++a){if(l=+o[a],l===i){if(c=!0,s.all)continue;break}h=t.values[l],Ne(h)&&(n||0===e||fi(e)===fi(h))&&(e+=h)}return c||s.all?e:0}function Io(t,e){const i=t&&t.options.stacked;return i||void 0===i&&void 0!==e.stack}function Fo(t,e,i){const s=t[e]||(t[e]={});return s[i]||(s[i]={})}function Vo(t,e,i,s){for(const o of e.getMatchingVisibleMetas(s).reverse()){const e=t[o.index];if(i&&e>0||!i&&e<0)return o.index}return null}function Ho(t,e){const{chart:i,_cachedMeta:s}=t,o=i._stacks||(i._stacks={}),{iScale:n,vScale:a,index:r}=s,l=n.axis,h=a.axis,c=function(t,e,i){return`${t.id}.${e.id}.${i.stack||i.type}`}(n,a,s),d=e.length;let u;for(let p=0;p<d;++p){const t=e[p],{[l]:i,[h]:n}=t;u=(t._stacks||(t._stacks={}))[h]=Fo(o,c,i),u[r]=n,u._top=Vo(u,a,!0,s.type),u._bottom=Vo(u,a,!1,s.type);(u._visualValues||(u._visualValues={}))[r]=n}}function No(t,e){const i=t.scales;return Object.keys(i).filter(t=>i[t].axis===e).shift()}function Bo(t,e){const i=t.controller.index,s=t.vScale&&t.vScale.axis;if(s){e=e||t._parsed;for(const t of e){const e=t._stacks;if(!e||void 0===e[s]||void 0===e[s][i])return;delete e[s][i],void 0!==e[s]._visualValues&&void 0!==e[s]._visualValues[i]&&delete e[s]._visualValues[i]}}}const Wo=t=>"reset"===t||"none"===t,jo=(t,e)=>e?t:Object.assign({},t);class Uo{constructor(t,e){this.chart=t,this._ctx=t.ctx,this.index=e,this._cachedDataOpts={},this._cachedMeta=this.getMeta(),this._type=this._cachedMeta.type,this.options=void 0,this._parsing=!1,this._data=void 0,this._objectData=void 0,this._sharedOptions=void 0,this._drawStart=void 0,this._drawCount=void 0,this.enableOptionSharing=!1,this.supportsDecimation=!1,this.$context=void 0,this._syncList=[],this.datasetElementType=new.target.datasetElementType,this.dataElementType=new.target.dataElementType,this.initialize()}initialize(){const t=this._cachedMeta;this.configure(),this.linkScales(),t._stacked=Io(t.vScale,t),this.addElements(),this.options.fill&&!this.chart.isPluginEnabled("filler")&&console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options")}updateIndex(t){this.index!==t&&Bo(this._cachedMeta),this.index=t}linkScales(){const t=this.chart,e=this._cachedMeta,i=this.getDataset(),s=(t,e,i,s)=>"x"===t?e:"r"===t?s:i,o=e.xAxisID=We(i.xAxisID,No(t,"x")),n=e.yAxisID=We(i.yAxisID,No(t,"y")),a=e.rAxisID=We(i.rAxisID,No(t,"r")),r=e.indexAxis,l=e.iAxisID=s(r,o,n,a),h=e.vAxisID=s(r,n,o,a);e.xScale=this.getScaleForId(o),e.yScale=this.getScaleForId(n),e.rScale=this.getScaleForId(a),e.iScale=this.getScaleForId(l),e.vScale=this.getScaleForId(h)}getDataset(){return this.chart.data.datasets[this.index]}getMeta(){return this.chart.getDatasetMeta(this.index)}getScaleForId(t){return this.chart.scales[t]}_getOtherScale(t){const e=this._cachedMeta;return t===e.iScale?e.vScale:e.iScale}reset(){this._update("reset")}_destroy(){const t=this._cachedMeta;this._data&&Li(this._data,this),t._stacked&&Bo(t)}_dataCheck(){const t=this.getDataset(),e=t.data||(t.data=[]),i=this._data;if(He(e)){const t=this._cachedMeta;this._data=function(t,e){const{iScale:i,vScale:s}=e,o="x"===i.axis?"x":"y",n="x"===s.axis?"x":"y",a=Object.keys(t),r=new Array(a.length);let l,h,c;for(l=0,h=a.length;l<h;++l)c=a[l],r[l]={[o]:c,[n]:t[c]};return r}(e,t)}else if(i!==e){if(i){Li(i,this);const t=this._cachedMeta;Bo(t),t._parsed=[]}e&&Object.isExtensible(e)&&(o=this,(s=e)._chartjs?s._chartjs.listeners.push(o):(Object.defineProperty(s,"_chartjs",{configurable:!0,enumerable:!1,value:{listeners:[o]}}),Ti.forEach(t=>{const e="_onData"+ii(t),i=s[t];Object.defineProperty(s,t,{configurable:!0,enumerable:!1,value(...t){const o=i.apply(this,t);return s._chartjs.listeners.forEach(i=>{"function"==typeof i[e]&&i[e](...t)}),o}})}))),this._syncList=[],this._data=e}var s,o}addElements(){const t=this._cachedMeta;this._dataCheck(),this.datasetElementType&&(t.dataset=new this.datasetElementType)}buildOrUpdateElements(t){const e=this._cachedMeta,i=this.getDataset();let s=!1;this._dataCheck();const o=e._stacked;e._stacked=Io(e.vScale,e),e.stack!==i.stack&&(s=!0,Bo(e),e.stack=i.stack),this._resyncElements(t),(s||o!==e._stacked)&&(Ho(this,e._parsed),e._stacked=Io(e.vScale,e))}configure(){const t=this.chart.config,e=t.datasetScopeKeys(this._type),i=t.getOptionScopes(this.getDataset(),e,!0);this.options=t.createResolver(i,this.getContext()),this._parsing=this.options.parsing,this._cachedDataOpts={}}parse(t,e){const{_cachedMeta:i,_data:s}=this,{iScale:o,_stacked:n}=i,a=o.axis;let r,l,h,c=0===t&&e===s.length||i._sorted,d=t>0&&i._parsed[t-1];if(!1===this._parsing)i._parsed=s,i._sorted=!0,h=s;else{h=Ve(s[t])?this.parseArrayData(i,s,t,e):He(s[t])?this.parseObjectData(i,s,t,e):this.parsePrimitiveData(i,s,t,e);const o=()=>null===l[a]||d&&l[a]<d[a];for(r=0;r<e;++r)i._parsed[r+t]=l=h[r],c&&(o()&&(c=!1),d=l);i._sorted=c}n&&Ho(this,h)}parsePrimitiveData(t,e,i,s){const{iScale:o,vScale:n}=t,a=o.axis,r=n.axis,l=o.getLabels(),h=o===n,c=new Array(s);let d,u,p;for(d=0,u=s;d<u;++d)p=d+i,c[d]={[a]:h||o.parse(l[p],p),[r]:n.parse(e[p],p)};return c}parseArrayData(t,e,i,s){const{xScale:o,yScale:n}=t,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={x:o.parse(c[0],h),y:n.parse(c[1],h)};return a}parseObjectData(t,e,i,s){const{xScale:o,yScale:n}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l=new Array(s);let h,c,d,u;for(h=0,c=s;h<c;++h)d=h+i,u=e[d],l[h]={x:o.parse(ei(u,a),d),y:n.parse(ei(u,r),d)};return l}getParsed(t){return this._cachedMeta._parsed[t]}getDataElement(t){return this._cachedMeta.data[t]}applyStack(t,e,i){const s=this.chart,o=this._cachedMeta,n=e[t.axis];return zo({keys:Ro(s,!0),values:e._stacks[t.axis]._visualValues},n,o.index,{mode:i})}updateRangeFromParsed(t,e,i,s){const o=i[e.axis];let n=null===o?NaN:o;const a=s&&i._stacks[e.axis];s&&a&&(s.values=a,n=zo(s,o,this._cachedMeta.index)),t.min=Math.min(t.min,n),t.max=Math.max(t.max,n)}getMinMax(t,e){const i=this._cachedMeta,s=i._parsed,o=i._sorted&&t===i.iScale,n=s.length,a=this._getOtherScale(t),r=((t,e,i)=>t&&!e.hidden&&e._stacked&&{keys:Ro(i,!0),values:null})(e,i,this.chart),l={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY},{min:h,max:c}=function(t){const{min:e,max:i,minDefined:s,maxDefined:o}=t.getUserBounds();return{min:s?e:Number.NEGATIVE_INFINITY,max:o?i:Number.POSITIVE_INFINITY}}(a);let d,u;function p(){u=s[d];const e=u[a.axis];return!Ne(u[t.axis])||h>e||c<e}for(d=0;d<n&&(p()||(this.updateRangeFromParsed(l,t,u,r),!o));++d);if(o)for(d=n-1;d>=0;--d)if(!p()){this.updateRangeFromParsed(l,t,u,r);break}return l}getAllParsedValues(t){const e=this._cachedMeta._parsed,i=[];let s,o,n;for(s=0,o=e.length;s<o;++s)n=e[s][t.axis],Ne(n)&&i.push(n);return i}getMaxOverflow(){return!1}getLabelAndValue(t){const e=this._cachedMeta,i=e.iScale,s=e.vScale,o=this.getParsed(t);return{label:i?""+i.getLabelForValue(o[i.axis]):"",value:s?""+s.getLabelForValue(o[s.axis]):""}}_update(t){const e=this._cachedMeta;this.update(t||"default"),e._clip=function(t){let e,i,s,o;return He(t)?(e=t.top,i=t.right,s=t.bottom,o=t.left):e=i=s=o=t,{top:e,right:i,bottom:s,left:o,disabled:!1===t}}(We(this.options.clip,function(t,e,i){if(!1===i)return!1;const s=Lo(t,i),o=Lo(e,i);return{top:o.end,right:s.end,bottom:o.start,left:s.start}}(e.xScale,e.yScale,this.getMaxOverflow())))}update(t){}draw(){const t=this._ctx,e=this.chart,i=this._cachedMeta,s=i.data||[],o=e.chartArea,n=[],a=this._drawStart||0,r=this._drawCount||s.length-a,l=this.options.drawActiveElementsOnTop;let h;for(i.dataset&&i.dataset.draw(t,o,a,r),h=a;h<a+r;++h){const e=s[h];e.hidden||(e.active&&l?n.push(e):e.draw(t,o))}for(h=0;h<n.length;++h)n[h].draw(t,o)}getStyle(t,e){const i=e?"active":"default";return void 0===t&&this._cachedMeta.dataset?this.resolveDatasetElementOptions(i):this.resolveDataElementOptions(t||0,i)}getContext(t,e,i){const s=this.getDataset();let o;if(t>=0&&t<this._cachedMeta.data.length){const e=this._cachedMeta.data[t];o=e.$context||(e.$context=function(t,e,i){return Os(t,{active:!1,dataIndex:e,parsed:void 0,raw:void 0,element:i,index:e,mode:"default",type:"data"})}(this.getContext(),t,e)),o.parsed=this.getParsed(t),o.raw=s.data[t],o.index=o.dataIndex=t}else o=this.$context||(this.$context=function(t,e){return Os(t,{active:!1,dataset:void 0,datasetIndex:e,index:e,mode:"default",type:"dataset"})}(this.chart.getContext(),this.index)),o.dataset=s,o.index=o.datasetIndex=this.index;return o.active=!!e,o.mode=i,o}resolveDatasetElementOptions(t){return this._resolveElementOptions(this.datasetElementType.id,t)}resolveDataElementOptions(t,e){return this._resolveElementOptions(this.dataElementType.id,e,t)}_resolveElementOptions(t,e="default",i){const s="active"===e,o=this._cachedDataOpts,n=t+"-"+e,a=o[n],r=this.enableOptionSharing&&si(i);if(a)return jo(a,r);const l=this.chart.config,h=l.datasetElementScopeKeys(this._type,t),c=s?[`${t}Hover`,"hover",t,""]:[t,""],d=l.getOptionScopes(this.getDataset(),h),u=Object.keys(as.elements[t]),p=l.resolveNamedOptions(d,u,()=>this.getContext(i,s,e),c);return p.$shared&&(p.$shared=r,o[n]=Object.freeze(jo(p,r))),p}_resolveAnimations(t,e,i){const s=this.chart,o=this._cachedDataOpts,n=`animation-${e}`,a=o[n];if(a)return a;let r;if(!1!==s.options.animation){const s=this.chart.config,o=s.datasetAnimationScopeKeys(this._type,e),n=s.getOptionScopes(this.getDataset(),o);r=s.createResolver(n,this.getContext(t,i,e))}const l=new To(s,r&&r.animations);return r&&r._cacheable&&(o[n]=Object.freeze(l)),l}getSharedOptions(t){if(t.$shared)return this._sharedOptions||(this._sharedOptions=Object.assign({},t))}includeOptions(t,e){return!e||Wo(t)||this.chart._animationsDisabled}_getSharedOptions(t,e){const i=this.resolveDataElementOptions(t,e),s=this._sharedOptions,o=this.getSharedOptions(i),n=this.includeOptions(e,o)||o!==s;return this.updateSharedOptions(o,e,i),{sharedOptions:o,includeOptions:n}}updateElement(t,e,i,s){Wo(s)?Object.assign(t,i):this._resolveAnimations(e,s).update(t,i)}updateSharedOptions(t,e,i){t&&!Wo(e)&&this._resolveAnimations(void 0,e).update(t,i)}_setStyle(t,e,i,s){t.active=s;const o=this.getStyle(e,s);this._resolveAnimations(e,i,s).update(t,{options:!s&&this.getSharedOptions(o)||o})}removeHoverStyle(t,e,i){this._setStyle(t,i,"active",!1)}setHoverStyle(t,e,i){this._setStyle(t,i,"active",!0)}_removeDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!1)}_setDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!0)}_resyncElements(t){const e=this._data,i=this._cachedMeta.data;for(const[a,r,l]of this._syncList)this[a](r,l);this._syncList=[];const s=i.length,o=e.length,n=Math.min(o,s);n&&this.parse(0,n),o>s?this._insertElements(s,o-s,t):o<s&&this._removeElements(o,s-o)}_insertElements(t,e,i=!0){const s=this._cachedMeta,o=s.data,n=t+e;let a;const r=t=>{for(t.length+=e,a=t.length-1;a>=n;a--)t[a]=t[a-e]};for(r(o),a=t;a<n;++a)o[a]=new this.dataElementType;this._parsing&&r(s._parsed),this.parse(t,e),i&&this.updateElements(o,t,e,"reset")}updateElements(t,e,i,s){}_removeElements(t,e){const i=this._cachedMeta;if(this._parsing){const s=i._parsed.splice(t,e);i._stacked&&Bo(i,s)}i.data.splice(t,e)}_sync(t){if(this._parsing)this._syncList.push(t);else{const[e,i,s]=t;this[e](i,s)}this.chart._dataChanges.push([this.index,...t])}_onDataPush(){const t=arguments.length;this._sync(["_insertElements",this.getDataset().data.length-t,t])}_onDataPop(){this._sync(["_removeElements",this._cachedMeta.data.length-1,1])}_onDataShift(){this._sync(["_removeElements",0,1])}_onDataSplice(t,e){e&&this._sync(["_removeElements",t,e]);const i=arguments.length-2;i&&this._sync(["_insertElements",t,i])}_onDataUnshift(){this._sync(["_insertElements",0,arguments.length])}}function Yo(t){const e=t.iScale,i=function(t,e){if(!t._cache.$bar){const i=t.getMatchingVisibleMetas(e);let s=[];for(let e=0,o=i.length;e<o;e++)s=s.concat(i[e].controller.getAllParsedValues(t));t._cache.$bar=Ri(s.sort((t,e)=>t-e))}return t._cache.$bar}(e,t.type);let s,o,n,a,r=e._length;const l=()=>{32767!==n&&-32768!==n&&(si(a)&&(r=Math.min(r,Math.abs(n-a)||r)),a=n)};for(s=0,o=i.length;s<o;++s)n=e.getPixelForValue(i[s]),l();for(a=void 0,s=0,o=e.ticks.length;s<o;++s)n=e.getPixelForTick(s),l();return r}function Xo(t,e,i,s){return Ve(t)?function(t,e,i,s){const o=i.parse(t[0],s),n=i.parse(t[1],s),a=Math.min(o,n),r=Math.max(o,n);let l=a,h=r;Math.abs(a)>Math.abs(r)&&(l=r,h=a),e[i.axis]=h,e._custom={barStart:l,barEnd:h,start:o,end:n,min:a,max:r}}(t,e,i,s):e[i.axis]=i.parse(t,s),e}function qo(t,e,i,s){const o=t.iScale,n=t.vScale,a=o.getLabels(),r=o===n,l=[];let h,c,d,u;for(h=i,c=i+s;h<c;++h)u=e[h],d={},d[o.axis]=r||o.parse(a[h],h),l.push(Xo(u,d,n,h));return l}function Go(t){return t&&void 0!==t.barStart&&void 0!==t.barEnd}function Ko(t,e,i,s){let o=e.borderSkipped;const n={};if(!o)return void(t.borderSkipped=n);if(!0===o)return void(t.borderSkipped={top:!0,right:!0,bottom:!0,left:!0});const{start:a,end:r,reverse:l,top:h,bottom:c}=function(t){let e,i,s,o,n;return t.horizontal?(e=t.base>t.x,i="left",s="right"):(e=t.base<t.y,i="bottom",s="top"),e?(o="end",n="start"):(o="start",n="end"),{start:i,end:s,reverse:e,top:o,bottom:n}}(t);"middle"===o&&i&&(t.enableBorderRadius=!0,(i._top||0)===s?o=h:(i._bottom||0)===s?o=c:(n[Jo(c,a,r,l)]=!0,o=h)),n[Jo(o,a,r,l)]=!0,t.borderSkipped=n}function Jo(t,e,i,s){var o,n,a;return s?(a=i,t=Zo(t=(o=t)===(n=e)?a:o===a?n:o,i,e)):t=Zo(t,e,i),t}function Zo(t,e,i){return"start"===t?e:"end"===t?i:t}function Qo(t,{inflateAmount:e},i){t.inflateAmount="auto"===e?1===i?.33:0:e}s(Uo,"defaults",{}),s(Uo,"datasetElementType",null),s(Uo,"dataElementType",null);class tn extends Uo{parsePrimitiveData(t,e,i,s){return qo(t,e,i,s)}parseArrayData(t,e,i,s){return qo(t,e,i,s)}parseObjectData(t,e,i,s){const{iScale:o,vScale:n}=t,{xAxisKey:a="x",yAxisKey:r="y"}=this._parsing,l="x"===o.axis?a:r,h="x"===n.axis?a:r,c=[];let d,u,p,g;for(d=i,u=i+s;d<u;++d)g=e[d],p={},p[o.axis]=o.parse(ei(g,l),d),c.push(Xo(ei(g,h),p,n,d));return c}updateRangeFromParsed(t,e,i,s){super.updateRangeFromParsed(t,e,i,s);const o=i._custom;o&&e===this._cachedMeta.vScale&&(t.min=Math.min(t.min,o.min),t.max=Math.max(t.max,o.max))}getMaxOverflow(){return 0}getLabelAndValue(t){const e=this._cachedMeta,{iScale:i,vScale:s}=e,o=this.getParsed(t),n=o._custom,a=Go(n)?"["+n.start+", "+n.end+"]":""+s.getLabelForValue(o[s.axis]);return{label:""+i.getLabelForValue(o[i.axis]),value:a}}initialize(){this.enableOptionSharing=!0,super.initialize();this._cachedMeta.stack=this.getDataset().stack}update(t){const e=this._cachedMeta;this.updateElements(e.data,0,e.data.length,t)}updateElements(t,e,i,s){const o="reset"===s,{index:n,_cachedMeta:{vScale:a}}=this,r=a.getBasePixel(),l=a.isHorizontal(),h=this._getRuler(),{sharedOptions:c,includeOptions:d}=this._getSharedOptions(e,s);for(let u=e;u<e+i;u++){const e=this.getParsed(u),i=o||Fe(e[a.axis])?{base:r,head:r}:this._calculateBarValuePixels(u),p=this._calculateBarIndexPixels(u,h),g=(e._stacks||{})[a.axis],f={horizontal:l,base:i.base,enableBorderRadius:!g||Go(e._custom)||n===g._top||n===g._bottom,x:l?i.head:p.center,y:l?p.center:i.head,height:l?p.size:Math.abs(i.size),width:l?Math.abs(i.size):p.size};d&&(f.options=c||this.resolveDataElementOptions(u,t[u].active?"active":s));const m=f.options||t[u].options;Ko(f,m,g,n),Qo(f,m,h.ratio),this.updateElement(t[u],u,f,s)}}_getStacks(t,e){const{iScale:i}=this._cachedMeta,s=i.getMatchingVisibleMetas(this._type).filter(t=>t.controller.options.grouped),o=i.options.stacked,n=[],a=this._cachedMeta.controller.getParsed(e),r=a&&a[i.axis],l=t=>{const e=t._parsed.find(t=>t[i.axis]===r),s=e&&e[t.vScale.axis];if(Fe(s)||isNaN(s))return!0};for(const h of s)if((void 0===e||!l(h))&&((!1===o||-1===n.indexOf(h.stack)||void 0===o&&void 0===h.stack)&&n.push(h.stack),h.index===t))break;return n.length||n.push(void 0),n}_getStackCount(t){return this._getStacks(void 0,t).length}_getAxisCount(){return this._getAxis().length}getFirstScaleIdForIndexAxis(){const t=this.chart.scales,e=this.chart.options.indexAxis;return Object.keys(t).filter(i=>t[i].axis===e).shift()}_getAxis(){const t={},e=this.getFirstScaleIdForIndexAxis();for(const i of this.chart.data.datasets)t[We("x"===this.chart.options.indexAxis?i.xAxisID:i.yAxisID,e)]=!0;return Object.keys(t)}_getStackIndex(t,e,i){const s=this._getStacks(t,i),o=void 0!==e?s.indexOf(e):-1;return-1===o?s.length-1:o}_getRuler(){const t=this.options,e=this._cachedMeta,i=e.iScale,s=[];let o,n;for(o=0,n=e.data.length;o<n;++o)s.push(i.getPixelForValue(this.getParsed(o)[i.axis],o));const a=t.barThickness;return{min:a||Yo(e),pixels:s,start:i._startPixel,end:i._endPixel,stackCount:this._getStackCount(),scale:i,grouped:t.grouped,ratio:a?1:t.categoryPercentage*t.barPercentage}}_calculateBarValuePixels(t){const{_cachedMeta:{vScale:e,_stacked:i,index:s},options:{base:o,minBarLength:n}}=this,a=o||0,r=this.getParsed(t),l=r._custom,h=Go(l);let c,d,u=r[e.axis],p=0,g=i?this.applyStack(e,r,i):u;g!==u&&(p=g-u,g=u),h&&(u=l.barStart,g=l.barEnd-l.barStart,0!==u&&fi(u)!==fi(l.barEnd)&&(p=0),p+=u);const f=Fe(o)||h?p:o;let m=e.getPixelForValue(f);if(c=this.chart.getDataVisibility(t)?e.getPixelForValue(p+g):m,d=c-m,Math.abs(d)<n){d=function(t,e,i){return 0!==t?fi(t):(e.isHorizontal()?1:-1)*(e.min>=i?1:-1)}(d,e,a)*n,u===a&&(m-=d/2);const t=e.getPixelForDecimal(0),o=e.getPixelForDecimal(1),l=Math.min(t,o),p=Math.max(t,o);m=Math.max(Math.min(m,p),l),c=m+d,i&&!h&&(r._stacks[e.axis]._visualValues[s]=e.getValueForPixel(c)-e.getValueForPixel(m))}if(m===e.getPixelForValue(a)){const t=fi(d)*e.getLineWidthForValue(a)/2;m+=t,d-=t}return{size:d,base:m,head:c,center:c+d/2}}_calculateBarIndexPixels(t,e){const i=e.scale,s=this.options,o=s.skipNull,n=We(s.maxBarThickness,1/0);let a,r;const l=this._getAxisCount();if(e.grouped){const i=o?this._getStackCount(t):e.stackCount,h="flex"===s.barThickness?function(t,e,i,s){const o=e.pixels,n=o[t];let a=t>0?o[t-1]:null,r=t<o.length-1?o[t+1]:null;const l=i.categoryPercentage;null===a&&(a=n-(null===r?e.end-e.start:r-n)),null===r&&(r=n+n-a);const h=n-(n-Math.min(a,r))/2*l;return{chunk:Math.abs(r-a)/2*l/s,ratio:i.barPercentage,start:h}}(t,e,s,i*l):function(t,e,i,s){const o=i.barThickness;let n,a;return Fe(o)?(n=e.min*i.categoryPercentage,a=i.barPercentage):(n=o*s,a=1),{chunk:n/s,ratio:a,start:e.pixels[t]-n/2}}(t,e,s,i*l),c="x"===this.chart.options.indexAxis?this.getDataset().xAxisID:this.getDataset().yAxisID,d=this._getAxis().indexOf(We(c,this.getFirstScaleIdForIndexAxis())),u=this._getStackIndex(this.index,this._cachedMeta.stack,o?t:void 0)+d;a=h.start+h.chunk*u+h.chunk/2,r=Math.min(n,h.chunk*h.ratio)}else a=i.getPixelForValue(this.getParsed(t)[i.axis],t),r=Math.min(n,e.min*e.ratio);return{base:a-r/2,head:a+r/2,center:a,size:r}}draw(){const t=this._cachedMeta,e=t.vScale,i=t.data,s=i.length;let o=0;for(;o<s;++o)null===this.getParsed(o)[e.axis]||i[o].hidden||i[o].draw(this._ctx)}}s(tn,"id","bar"),s(tn,"defaults",{datasetElementType:!1,dataElementType:"bar",categoryPercentage:.8,barPercentage:.9,grouped:!0,animations:{numbers:{type:"number",properties:["x","y","base","width","height"]}}}),s(tn,"overrides",{scales:{_index_:{type:"category",offset:!0,grid:{offset:!0}},_value_:{type:"linear",beginAtZero:!0}}});class en extends Uo{initialize(){this.enableOptionSharing=!0,super.initialize()}parsePrimitiveData(t,e,i,s){const o=super.parsePrimitiveData(t,e,i,s);for(let n=0;n<o.length;n++)o[n]._custom=this.resolveDataElementOptions(n+i).radius;return o}parseArrayData(t,e,i,s){const o=super.parseArrayData(t,e,i,s);for(let n=0;n<o.length;n++){const t=e[i+n];o[n]._custom=We(t[2],this.resolveDataElementOptions(n+i).radius)}return o}parseObjectData(t,e,i,s){const o=super.parseObjectData(t,e,i,s);for(let n=0;n<o.length;n++){const t=e[i+n];o[n]._custom=We(t&&t.r&&+t.r,this.resolveDataElementOptions(n+i).radius)}return o}getMaxOverflow(){const t=this._cachedMeta.data;let e=0;for(let i=t.length-1;i>=0;--i)e=Math.max(e,t[i].size(this.resolveDataElementOptions(i))/2);return e>0&&e}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:o}=e,n=this.getParsed(t),a=s.getLabelForValue(n.x),r=o.getLabelForValue(n.y),l=n._custom;return{label:i[t]||"",value:"("+a+", "+r+(l?", "+l:"")+")"}}update(t){const e=this._cachedMeta.data;this.updateElements(e,0,e.length,t)}updateElements(t,e,i,s){const o="reset"===s,{iScale:n,vScale:a}=this._cachedMeta,{sharedOptions:r,includeOptions:l}=this._getSharedOptions(e,s),h=n.axis,c=a.axis;for(let d=e;d<e+i;d++){const e=t[d],i=!o&&this.getParsed(d),u={},p=u[h]=o?n.getPixelForDecimal(.5):n.getPixelForValue(i[h]),g=u[c]=o?a.getBasePixel():a.getPixelForValue(i[c]);u.skip=isNaN(p)||isNaN(g),l&&(u.options=r||this.resolveDataElementOptions(d,e.active?"active":s),o&&(u.options.radius=0)),this.updateElement(e,d,u,s)}}resolveDataElementOptions(t,e){const i=this.getParsed(t);let s=super.resolveDataElementOptions(t,e);s.$shared&&(s=Object.assign({},s,{$shared:!1}));const o=s.radius;return"active"!==e&&(s.radius=0),s.radius+=We(i&&i._custom,o),s}}s(en,"id","bubble"),s(en,"defaults",{datasetElementType:!1,dataElementType:"point",animations:{numbers:{type:"number",properties:["x","y","borderWidth","radius"]}}}),s(en,"overrides",{scales:{x:{type:"linear"},y:{type:"linear"}}});class sn extends Uo{constructor(t,e){super(t,e),this.enableOptionSharing=!0,this.innerRadius=void 0,this.outerRadius=void 0,this.offsetX=void 0,this.offsetY=void 0}linkScales(){}parse(t,e){const i=this.getDataset().data,s=this._cachedMeta;if(!1===this._parsing)s._parsed=i;else{let o,n,a=t=>+i[t];if(He(i[t])){const{key:t="value"}=this._parsing;a=e=>+ei(i[e],t)}for(o=t,n=t+e;o<n;++o)s._parsed[o]=a(o)}}_getRotation(){return _i(this.options.rotation-90)}_getCircumference(){return _i(this.options.circumference)}_getRotationExtents(){let t=ri,e=-ri;for(let i=0;i<this.chart.data.datasets.length;++i)if(this.chart.isDatasetVisible(i)&&this.chart.getDatasetMeta(i).type===this._type){const s=this.chart.getDatasetMeta(i).controller,o=s._getRotation(),n=s._getCircumference();t=Math.min(t,o),e=Math.max(e,o+n)}return{rotation:t,circumference:e-t}}update(t){const e=this.chart,{chartArea:i}=e,s=this._cachedMeta,o=s.data,n=this.getMaxBorderWidth()+this.getMaxOffset(o)+this.options.spacing,a=Math.max((Math.min(i.width,i.height)-n)/2,0),r=Math.min((l=this.options.cutout,h=a,"string"==typeof l&&l.endsWith("%")?parseFloat(l)/100:+l/h),1);var l,h;const c=this._getRingWeight(this.index),{circumference:d,rotation:u}=this._getRotationExtents(),{ratioX:p,ratioY:g,offsetX:f,offsetY:m}=function(t,e,i){let s=1,o=1,n=0,a=0;if(e<ri){const r=t,l=r+e,h=Math.cos(r),c=Math.sin(r),d=Math.cos(l),u=Math.sin(l),p=(t,e,s)=>Pi(t,r,l,!0)?1:Math.max(e,e*i,s,s*i),g=(t,e,s)=>Pi(t,r,l,!0)?-1:Math.min(e,e*i,s,s*i),f=p(0,h,d),m=p(di,c,u),b=g(ai,h,d),x=g(ai+di,c,u);s=(f-b)/2,o=(m-x)/2,n=-(f+b)/2,a=-(m+x)/2}return{ratioX:s,ratioY:o,offsetX:n,offsetY:a}}(u,d,r),b=(i.width-n)/p,x=(i.height-n)/g,v=Math.max(Math.min(b,x)/2,0),_=je(this.options.radius,v),y=(_-Math.max(_*r,0))/this._getVisibleDatasetWeightTotal();this.offsetX=f*_,this.offsetY=m*_,s.total=this.calculateTotal(),this.outerRadius=_-y*this._getRingWeightOffset(this.index),this.innerRadius=Math.max(this.outerRadius-y*c,0),this.updateElements(o,0,o.length,t)}_circumference(t,e){const i=this.options,s=this._cachedMeta,o=this._getCircumference();return e&&i.animation.animateRotate||!this.chart.getDataVisibility(t)||null===s._parsed[t]||s.data[t].hidden?0:this.calculateCircumference(s._parsed[t]*o/ri)}updateElements(t,e,i,s){const o="reset"===s,n=this.chart,a=n.chartArea,r=n.options.animation,l=(a.left+a.right)/2,h=(a.top+a.bottom)/2,c=o&&r.animateScale,d=c?0:this.innerRadius,u=c?0:this.outerRadius,{sharedOptions:p,includeOptions:g}=this._getSharedOptions(e,s);let f,m=this._getRotation();for(f=0;f<e;++f)m+=this._circumference(f,o);for(f=e;f<e+i;++f){const e=this._circumference(f,o),i=t[f],n={x:l+this.offsetX,y:h+this.offsetY,startAngle:m,endAngle:m+e,circumference:e,outerRadius:u,innerRadius:d};g&&(n.options=p||this.resolveDataElementOptions(f,i.active?"active":s)),m+=e,this.updateElement(i,f,n,s)}}calculateTotal(){const t=this._cachedMeta,e=t.data;let i,s=0;for(i=0;i<e.length;i++){const o=t._parsed[i];null===o||isNaN(o)||!this.chart.getDataVisibility(i)||e[i].hidden||(s+=Math.abs(o))}return s}calculateCircumference(t){const e=this._cachedMeta.total;return e>0&&!isNaN(t)?ri*(Math.abs(t)/e):0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],o=Zi(e._parsed[t],i.options.locale);return{label:s[t]||"",value:o}}getMaxBorderWidth(t){let e=0;const i=this.chart;let s,o,n,a,r;if(!t)for(s=0,o=i.data.datasets.length;s<o;++s)if(i.isDatasetVisible(s)){n=i.getDatasetMeta(s),t=n.data,a=n.controller;break}if(!t)return 0;for(s=0,o=t.length;s<o;++s)r=a.resolveDataElementOptions(s),"inner"!==r.borderAlign&&(e=Math.max(e,r.borderWidth||0,r.hoverBorderWidth||0));return e}getMaxOffset(t){let e=0;for(let i=0,s=t.length;i<s;++i){const t=this.resolveDataElementOptions(i);e=Math.max(e,t.offset||0,t.hoverOffset||0)}return e}_getRingWeightOffset(t){let e=0;for(let i=0;i<t;++i)this.chart.isDatasetVisible(i)&&(e+=this._getRingWeight(i));return e}_getRingWeight(t){return Math.max(We(this.chart.data.datasets[t].weight,1),0)}_getVisibleDatasetWeightTotal(){return this._getRingWeightOffset(this.chart.data.datasets.length)||1}}s(sn,"id","doughnut"),s(sn,"defaults",{datasetElementType:!1,dataElementType:"arc",animation:{animateRotate:!0,animateScale:!1},animations:{numbers:{type:"number",properties:["circumference","endAngle","innerRadius","outerRadius","startAngle","x","y","offset","borderWidth","spacing"]}},cutout:"50%",rotation:0,circumference:360,radius:"100%",spacing:0,indexAxis:"r"}),s(sn,"descriptors",{_scriptable:t=>"spacing"!==t,_indexable:t=>"spacing"!==t&&!t.startsWith("borderDash")&&!t.startsWith("hoverBorderDash")}),s(sn,"overrides",{aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data,{labels:{pointStyle:i,textAlign:s,color:o,useBorderRadius:n,borderRadius:a}}=t.legend.options;return e.labels.length&&e.datasets.length?e.labels.map((e,r)=>{const l=t.getDatasetMeta(0).controller.getStyle(r);return{text:e,fillStyle:l.backgroundColor,fontColor:o,hidden:!t.getDataVisibility(r),lineDash:l.borderDash,lineDashOffset:l.borderDashOffset,lineJoin:l.borderJoinStyle,lineWidth:l.borderWidth,strokeStyle:l.borderColor,textAlign:s,pointStyle:i,borderRadius:n&&(a||l.borderRadius),index:r}}):[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}}});class on extends Uo{initialize(){this.enableOptionSharing=!0,this.supportsDecimation=!0,super.initialize()}update(t){const e=this._cachedMeta,{dataset:i,data:s=[],_dataset:o}=e,n=this.chart._animationsDisabled;let{start:a,count:r}=Hi(e,s,n);this._drawStart=a,this._drawCount=r,Ni(e)&&(a=0,r=s.length),i._chart=this.chart,i._datasetIndex=this.index,i._decimated=!!o._decimated,i.points=s;const l=this.resolveDatasetElementOptions(t);this.options.showLine||(l.borderWidth=0),l.segment=this.options.segment,this.updateElement(i,void 0,{animated:!n,options:l},t),this.updateElements(s,a,r,t)}updateElements(t,e,i,s){const o="reset"===s,{iScale:n,vScale:a,_stacked:r,_dataset:l}=this._cachedMeta,{sharedOptions:h,includeOptions:c}=this._getSharedOptions(e,s),d=n.axis,u=a.axis,{spanGaps:p,segment:g}=this.options,f=xi(p)?p:Number.POSITIVE_INFINITY,m=this.chart._animationsDisabled||o||"none"===s,b=e+i,x=t.length;let v=e>0&&this.getParsed(e-1);for(let _=0;_<x;++_){const i=t[_],p=m?i:{};if(_<e||_>=b){p.skip=!0;continue}const x=this.getParsed(_),y=Fe(x[u]),w=p[d]=n.getPixelForValue(x[d],_),k=p[u]=o||y?a.getBasePixel():a.getPixelForValue(r?this.applyStack(a,x,r):x[u],_);p.skip=isNaN(w)||isNaN(k)||y,p.stop=_>0&&Math.abs(x[d]-v[d])>f,g&&(p.parsed=x,p.raw=l.data[_]),c&&(p.options=h||this.resolveDataElementOptions(_,i.active?"active":s)),m||this.updateElement(i,_,p,s),v=x}}getMaxOverflow(){const t=this._cachedMeta,e=t.dataset,i=e.options&&e.options.borderWidth||0,s=t.data||[];if(!s.length)return i;const o=s[0].size(this.resolveDataElementOptions(0)),n=s[s.length-1].size(this.resolveDataElementOptions(s.length-1));return Math.max(i,o,n)/2}draw(){const t=this._cachedMeta;t.dataset.updateControlPoints(this.chart.chartArea,t.iScale.axis),super.draw()}}s(on,"id","line"),s(on,"defaults",{datasetElementType:"line",dataElementType:"point",showLine:!0,spanGaps:!1}),s(on,"overrides",{scales:{_index_:{type:"category"},_value_:{type:"linear"}}});class nn extends Uo{constructor(t,e){super(t,e),this.innerRadius=void 0,this.outerRadius=void 0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],o=Zi(e._parsed[t].r,i.options.locale);return{label:s[t]||"",value:o}}parseObjectData(t,e,i,s){return Ys.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta.data;this._updateRadius(),this.updateElements(e,0,e.length,t)}getMinMax(){const t=this._cachedMeta,e={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};return t.data.forEach((t,i)=>{const s=this.getParsed(i).r;!isNaN(s)&&this.chart.getDataVisibility(i)&&(s<e.min&&(e.min=s),s>e.max&&(e.max=s))}),e}_updateRadius(){const t=this.chart,e=t.chartArea,i=t.options,s=Math.min(e.right-e.left,e.bottom-e.top),o=Math.max(s/2,0),n=(o-Math.max(i.cutoutPercentage?o/100*i.cutoutPercentage:1,0))/t.getVisibleDatasetCount();this.outerRadius=o-n*this.index,this.innerRadius=this.outerRadius-n}updateElements(t,e,i,s){const o="reset"===s,n=this.chart,a=n.options.animation,r=this._cachedMeta.rScale,l=r.xCenter,h=r.yCenter,c=r.getIndexAngle(0)-.5*ai;let d,u=c;const p=360/this.countVisibleElements();for(d=0;d<e;++d)u+=this._computeAngle(d,s,p);for(d=e;d<e+i;d++){const e=t[d];let i=u,g=u+this._computeAngle(d,s,p),f=n.getDataVisibility(d)?r.getDistanceFromCenterForValue(this.getParsed(d).r):0;u=g,o&&(a.animateScale&&(f=0),a.animateRotate&&(i=g=c));const m={x:l,y:h,innerRadius:0,outerRadius:f,startAngle:i,endAngle:g,options:this.resolveDataElementOptions(d,e.active?"active":s)};this.updateElement(e,d,m,s)}}countVisibleElements(){const t=this._cachedMeta;let e=0;return t.data.forEach((t,i)=>{!isNaN(this.getParsed(i).r)&&this.chart.getDataVisibility(i)&&e++}),e}_computeAngle(t,e,i){return this.chart.getDataVisibility(t)?_i(this.resolveDataElementOptions(t,e).angle||i):0}}s(nn,"id","polarArea"),s(nn,"defaults",{dataElementType:"arc",animation:{animateRotate:!0,animateScale:!0},animations:{numbers:{type:"number",properties:["x","y","startAngle","endAngle","innerRadius","outerRadius"]}},indexAxis:"r",startAngle:0}),s(nn,"overrides",{aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map((e,o)=>{const n=t.getDatasetMeta(0).controller.getStyle(o);return{text:e,fillStyle:n.backgroundColor,strokeStyle:n.borderColor,fontColor:s,lineWidth:n.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(o),index:o}})}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}},scales:{r:{type:"radialLinear",angleLines:{display:!1},beginAtZero:!0,grid:{circular:!0},pointLabels:{display:!1},startAngle:0}}});class an extends sn{}s(an,"id","pie"),s(an,"defaults",{cutout:0,rotation:0,circumference:360,radius:"100%"});class rn extends Uo{getLabelAndValue(t){const e=this._cachedMeta.vScale,i=this.getParsed(t);return{label:e.getLabels()[t],value:""+e.getLabelForValue(i[e.axis])}}parseObjectData(t,e,i,s){return Ys.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta,i=e.dataset,s=e.data||[],o=e.iScale.getLabels();if(i.points=s,"resize"!==t){const e=this.resolveDatasetElementOptions(t);this.options.showLine||(e.borderWidth=0);const n={_loop:!0,_fullLoop:o.length===s.length,options:e};this.updateElement(i,void 0,n,t)}this.updateElements(s,0,s.length,t)}updateElements(t,e,i,s){const o=this._cachedMeta.rScale,n="reset"===s;for(let a=e;a<e+i;a++){const e=t[a],i=this.resolveDataElementOptions(a,e.active?"active":s),r=o.getPointPositionForValue(a,this.getParsed(a).r),l=n?o.xCenter:r.x,h=n?o.yCenter:r.y,c={x:l,y:h,angle:r.angle,skip:isNaN(l)||isNaN(h),options:i};this.updateElement(e,a,c,s)}}}s(rn,"id","radar"),s(rn,"defaults",{datasetElementType:"line",dataElementType:"point",indexAxis:"r",showLine:!0,elements:{line:{fill:"start"}}}),s(rn,"overrides",{aspectRatio:1,scales:{r:{type:"radialLinear"}}});class ln extends Uo{getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:o}=e,n=this.getParsed(t),a=s.getLabelForValue(n.x),r=o.getLabelForValue(n.y);return{label:i[t]||"",value:"("+a+", "+r+")"}}update(t){const e=this._cachedMeta,{data:i=[]}=e,s=this.chart._animationsDisabled;let{start:o,count:n}=Hi(e,i,s);if(this._drawStart=o,this._drawCount=n,Ni(e)&&(o=0,n=i.length),this.options.showLine){this.datasetElementType||this.addElements();const{dataset:o,_dataset:n}=e;o._chart=this.chart,o._datasetIndex=this.index,o._decimated=!!n._decimated,o.points=i;const a=this.resolveDatasetElementOptions(t);a.segment=this.options.segment,this.updateElement(o,void 0,{animated:!s,options:a},t)}else this.datasetElementType&&(delete e.dataset,this.datasetElementType=!1);this.updateElements(i,o,n,t)}addElements(){const{showLine:t}=this.options;!this.datasetElementType&&t&&(this.datasetElementType=this.chart.registry.getElement("line")),super.addElements()}updateElements(t,e,i,s){const o="reset"===s,{iScale:n,vScale:a,_stacked:r,_dataset:l}=this._cachedMeta,h=this.resolveDataElementOptions(e,s),c=this.getSharedOptions(h),d=this.includeOptions(s,c),u=n.axis,p=a.axis,{spanGaps:g,segment:f}=this.options,m=xi(g)?g:Number.POSITIVE_INFINITY,b=this.chart._animationsDisabled||o||"none"===s;let x=e>0&&this.getParsed(e-1);for(let v=e;v<e+i;++v){const e=t[v],i=this.getParsed(v),h=b?e:{},g=Fe(i[p]),_=h[u]=n.getPixelForValue(i[u],v),y=h[p]=o||g?a.getBasePixel():a.getPixelForValue(r?this.applyStack(a,i,r):i[p],v);h.skip=isNaN(_)||isNaN(y)||g,h.stop=v>0&&Math.abs(i[u]-x[u])>m,f&&(h.parsed=i,h.raw=l.data[v]),d&&(h.options=c||this.resolveDataElementOptions(v,e.active?"active":s)),b||this.updateElement(e,v,h,s),x=i}this.updateSharedOptions(c,s,h)}getMaxOverflow(){const t=this._cachedMeta,e=t.data||[];if(!this.options.showLine){let t=0;for(let i=e.length-1;i>=0;--i)t=Math.max(t,e[i].size(this.resolveDataElementOptions(i))/2);return t>0&&t}const i=t.dataset,s=i.options&&i.options.borderWidth||0;if(!e.length)return s;const o=e[0].size(this.resolveDataElementOptions(0)),n=e[e.length-1].size(this.resolveDataElementOptions(e.length-1));return Math.max(s,o,n)/2}}s(ln,"id","scatter"),s(ln,"defaults",{datasetElementType:!1,dataElementType:"point",showLine:!1,fill:!1}),s(ln,"overrides",{interaction:{mode:"point"},scales:{x:{type:"linear"},y:{type:"linear"}}});var hn=Object.freeze({__proto__:null,BarController:tn,BubbleController:en,DoughnutController:sn,LineController:on,PieController:an,PolarAreaController:nn,RadarController:rn,ScatterController:ln});function cn(){throw new Error("This method is not implemented: Check that a complete date adapter is provided.")}class dn{constructor(t){s(this,"options"),this.options=t||{}}static override(t){Object.assign(dn.prototype,t)}init(){}formats(){return cn()}parse(){return cn()}format(){return cn()}add(){return cn()}diff(){return cn()}startOf(){return cn()}endOf(){return cn()}}var un=dn;function pn(t,e,i,s){const{controller:o,data:n,_sorted:a}=t,r=o._cachedMeta.iScale,l=t.dataset&&t.dataset.options?t.dataset.options.spanGaps:null;if(r&&e===r.axis&&"r"!==e&&a&&n.length){const a=r._reversePixels?Oi:Di;if(!s){const s=a(n,e,i);if(l){const{vScale:e}=o._cachedMeta,{_parsed:i}=t,n=i.slice(0,s.lo+1).reverse().findIndex(t=>!Fe(t[e.axis]));s.lo-=Math.max(0,n);const a=i.slice(s.hi).findIndex(t=>!Fe(t[e.axis]));s.hi+=Math.max(0,a)}return s}if(o._sharedOptions){const t=n[0],s="function"==typeof t.getRange&&t.getRange(e);if(s){const t=a(n,e,i-s),o=a(n,e,i+s);return{lo:t.lo,hi:o.hi}}}}return{lo:0,hi:n.length-1}}function gn(t,e,i,s,o){const n=t.getSortedVisibleDatasetMetas(),a=i[e];for(let r=0,l=n.length;r<l;++r){const{index:t,data:i}=n[r],{lo:l,hi:h}=pn(n[r],e,a,o);for(let e=l;e<=h;++e){const o=i[e];o.skip||s(o,t,e)}}}function fn(t,e,i,s,o){const n=[];if(!o&&!t.isPointInArea(e))return n;return gn(t,i,e,function(i,a,r){(o||ps(i,t.chartArea,0))&&i.inRange(e.x,e.y,s)&&n.push({element:i,datasetIndex:a,index:r})},!0),n}function mn(t,e,i,s,o,n){let a=[];const r=function(t){const e=-1!==t.indexOf("x"),i=-1!==t.indexOf("y");return function(t,s){const o=e?Math.abs(t.x-s.x):0,n=i?Math.abs(t.y-s.y):0;return Math.sqrt(Math.pow(o,2)+Math.pow(n,2))}}(i);let l=Number.POSITIVE_INFINITY;return gn(t,i,e,function(i,h,c){const d=i.inRange(e.x,e.y,o);if(s&&!d)return;const u=i.getCenterPoint(o);if(!(!!n||t.isPointInArea(u))&&!d)return;const p=r(e,u);p<l?(a=[{element:i,datasetIndex:h,index:c}],l=p):p===l&&a.push({element:i,datasetIndex:h,index:c})}),a}function bn(t,e,i,s,o,n){return n||t.isPointInArea(e)?"r"!==i||s?mn(t,e,i,s,o,n):function(t,e,i,s){let o=[];return gn(t,i,e,function(t,i,n){const{startAngle:a,endAngle:r}=t.getProps(["startAngle","endAngle"],s),{angle:l}=ki(t,{x:e.x,y:e.y});Pi(l,a,r)&&o.push({element:t,datasetIndex:i,index:n})}),o}(t,e,i,o):[]}function xn(t,e,i,s,o){const n=[],a="x"===i?"inXRange":"inYRange";let r=!1;return gn(t,i,e,(t,s,l)=>{t[a]&&t[a](e[i],o)&&(n.push({element:t,datasetIndex:s,index:l}),r=r||t.inRange(e.x,e.y,o))}),s&&!r?[]:n}var vn={modes:{index(t,e,i,s){const o=ao(e,t),n=i.axis||"x",a=i.includeInvisible||!1,r=i.intersect?fn(t,o,n,s,a):bn(t,o,n,!1,s,a),l=[];return r.length?(t.getSortedVisibleDatasetMetas().forEach(t=>{const e=r[0].index,i=t.data[e];i&&!i.skip&&l.push({element:i,datasetIndex:t.index,index:e})}),l):[]},dataset(t,e,i,s){const o=ao(e,t),n=i.axis||"xy",a=i.includeInvisible||!1;let r=i.intersect?fn(t,o,n,s,a):bn(t,o,n,!1,s,a);if(r.length>0){const e=r[0].datasetIndex,i=t.getDatasetMeta(e).data;r=[];for(let t=0;t<i.length;++t)r.push({element:i[t],datasetIndex:e,index:t})}return r},point:(t,e,i,s)=>fn(t,ao(e,t),i.axis||"xy",s,i.includeInvisible||!1),nearest(t,e,i,s){const o=ao(e,t),n=i.axis||"xy",a=i.includeInvisible||!1;return bn(t,o,n,i.intersect,s,a)},x:(t,e,i,s)=>xn(t,ao(e,t),"x",i.intersect,s),y:(t,e,i,s)=>xn(t,ao(e,t),"y",i.intersect,s)}};const _n=["left","top","right","bottom"];function yn(t,e){return t.filter(t=>t.pos===e)}function wn(t,e){return t.filter(t=>-1===_n.indexOf(t.pos)&&t.box.axis===e)}function kn(t,e){return t.sort((t,i)=>{const s=e?i:t,o=e?t:i;return s.weight===o.weight?s.index-o.index:s.weight-o.weight})}function Cn(t,e){const i=function(t){const e={};for(const i of t){const{stack:t,pos:s,stackWeight:o}=i;if(!t||!_n.includes(s))continue;const n=e[t]||(e[t]={count:0,placed:0,weight:0,size:0});n.count++,n.weight+=o}return e}(t),{vBoxMaxWidth:s,hBoxMaxHeight:o}=e;let n,a,r;for(n=0,a=t.length;n<a;++n){r=t[n];const{fullSize:a}=r.box,l=i[r.stack],h=l&&r.stackWeight/l.weight;r.horizontal?(r.width=h?h*s:a&&e.availableWidth,r.height=o):(r.width=s,r.height=h?h*o:a&&e.availableHeight)}return i}function Mn(t,e,i,s){return Math.max(t[i],e[i])+Math.max(t[s],e[s])}function Sn(t,e){t.top=Math.max(t.top,e.top),t.left=Math.max(t.left,e.left),t.bottom=Math.max(t.bottom,e.bottom),t.right=Math.max(t.right,e.right)}function Pn(t,e,i,s){const{pos:o,box:n}=i,a=t.maxPadding;if(!He(o)){i.size&&(t[o]-=i.size);const e=s[i.stack]||{size:0,count:1};e.size=Math.max(e.size,i.horizontal?n.height:n.width),i.size=e.size/e.count,t[o]+=i.size}n.getPadding&&Sn(a,n.getPadding());const r=Math.max(0,e.outerWidth-Mn(a,t,"left","right")),l=Math.max(0,e.outerHeight-Mn(a,t,"top","bottom")),h=r!==t.w,c=l!==t.h;return t.w=r,t.h=l,i.horizontal?{same:h,other:c}:{same:c,other:h}}function An(t,e){const i=e.maxPadding;function s(t){const s={left:0,top:0,right:0,bottom:0};return t.forEach(t=>{s[t]=Math.max(e[t],i[t])}),s}return s(t?["left","right"]:["top","bottom"])}function En(t,e,i,s){const o=[];let n,a,r,l,h,c;for(n=0,a=t.length,h=0;n<a;++n){r=t[n],l=r.box,l.update(r.width||e.w,r.height||e.h,An(r.horizontal,e));const{same:a,other:d}=Pn(e,i,r,s);h|=a&&o.length,c=c||d,l.fullSize||o.push(r)}return h&&En(o,e,i,s)||c}function $n(t,e,i,s,o){t.top=i,t.left=e,t.right=e+s,t.bottom=i+o,t.width=s,t.height=o}function Dn(t,e,i,s){const o=i.padding;let{x:n,y:a}=e;for(const r of t){const t=r.box,l=s[r.stack]||{placed:0,weight:1},h=r.stackWeight/l.weight||1;if(r.horizontal){const s=e.w*h,n=l.size||t.height;si(l.start)&&(a=l.start),t.fullSize?$n(t,o.left,a,i.outerWidth-o.right-o.left,n):$n(t,e.left+l.placed,a,s,n),l.start=a,l.placed+=s,a=t.bottom}else{const s=e.h*h,a=l.size||t.width;si(l.start)&&(n=l.start),t.fullSize?$n(t,n,o.top,a,i.outerHeight-o.bottom-o.top):$n(t,n,e.top+l.placed,a,s),l.start=n,l.placed+=s,n=t.right}}e.x=n,e.y=a}var On={addBox(t,e){t.boxes||(t.boxes=[]),e.fullSize=e.fullSize||!1,e.position=e.position||"top",e.weight=e.weight||0,e._layers=e._layers||function(){return[{z:0,draw(t){e.draw(t)}}]},t.boxes.push(e)},removeBox(t,e){const i=t.boxes?t.boxes.indexOf(e):-1;-1!==i&&t.boxes.splice(i,1)},configure(t,e,i){e.fullSize=i.fullSize,e.position=i.position,e.weight=i.weight},update(t,e,i,s){if(!t)return;const o=Es(t.options.layout.padding),n=Math.max(e-o.width,0),a=Math.max(i-o.height,0),r=function(t){const e=function(t){const e=[];let i,s,o,n,a,r;for(i=0,s=(t||[]).length;i<s;++i)o=t[i],({position:n,options:{stack:a,stackWeight:r=1}}=o),e.push({index:i,box:o,pos:n,horizontal:o.isHorizontal(),weight:o.weight,stack:a&&n+a,stackWeight:r});return e}(t),i=kn(e.filter(t=>t.box.fullSize),!0),s=kn(yn(e,"left"),!0),o=kn(yn(e,"right")),n=kn(yn(e,"top"),!0),a=kn(yn(e,"bottom")),r=wn(e,"x"),l=wn(e,"y");return{fullSize:i,leftAndTop:s.concat(n),rightAndBottom:o.concat(l).concat(a).concat(r),chartArea:yn(e,"chartArea"),vertical:s.concat(o).concat(l),horizontal:n.concat(a).concat(r)}}(t.boxes),l=r.vertical,h=r.horizontal;Ye(t.boxes,t=>{"function"==typeof t.beforeLayout&&t.beforeLayout()});const c=l.reduce((t,e)=>e.box.options&&!1===e.box.options.display?t:t+1,0)||1,d=Object.freeze({outerWidth:e,outerHeight:i,padding:o,availableWidth:n,availableHeight:a,vBoxMaxWidth:n/2/c,hBoxMaxHeight:a/2}),u=Object.assign({},o);Sn(u,Es(s));const p=Object.assign({maxPadding:u,w:n,h:a,x:o.left,y:o.top},o),g=Cn(l.concat(h),d);En(r.fullSize,p,d,g),En(l,p,d,g),En(h,p,d,g)&&En(l,p,d,g),function(t){const e=t.maxPadding;function i(i){const s=Math.max(e[i]-t[i],0);return t[i]+=s,s}t.y+=i("top"),t.x+=i("left"),i("right"),i("bottom")}(p),Dn(r.leftAndTop,p,d,g),p.x+=p.w,p.y+=p.h,Dn(r.rightAndBottom,p,d,g),t.chartArea={left:p.left,top:p.top,right:p.left+p.w,bottom:p.top+p.h,height:p.h,width:p.w},Ye(r.chartArea,e=>{const i=e.box;Object.assign(i,t.chartArea),i.update(p.w,p.h,{left:0,top:0,right:0,bottom:0})})}};class Tn{acquireContext(t,e){}releaseContext(t){return!1}addEventListener(t,e,i){}removeEventListener(t,e,i){}getDevicePixelRatio(){return 1}getMaximumSize(t,e,i,s){return e=Math.max(0,e||t.width),i=i||t.height,{width:e,height:Math.max(0,s?Math.floor(e/s):i)}}isAttached(t){return!0}updateConfig(t){}}class Ln extends Tn{acquireContext(t){return t&&t.getContext&&t.getContext("2d")||null}updateConfig(t){t.options.animation=!1}}const Rn="$chartjs",zn={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup",pointerenter:"mouseenter",pointerdown:"mousedown",pointermove:"mousemove",pointerup:"mouseup",pointerleave:"mouseout",pointerout:"mouseout"},In=t=>null===t||""===t;const Fn=!!co&&{passive:!0};function Vn(t,e,i){t&&t.canvas&&t.canvas.removeEventListener(e,i,Fn)}function Hn(t,e){for(const i of t)if(i===e||i.contains(e))return!0}function Nn(t,e,i){const s=t.canvas,o=new MutationObserver(t=>{let e=!1;for(const i of t)e=e||Hn(i.addedNodes,s),e=e&&!Hn(i.removedNodes,s);e&&i()});return o.observe(document,{childList:!0,subtree:!0}),o}function Bn(t,e,i){const s=t.canvas,o=new MutationObserver(t=>{let e=!1;for(const i of t)e=e||Hn(i.removedNodes,s),e=e&&!Hn(i.addedNodes,s);e&&i()});return o.observe(document,{childList:!0,subtree:!0}),o}const Wn=new Map;let jn=0;function Un(){const t=window.devicePixelRatio;t!==jn&&(jn=t,Wn.forEach((e,i)=>{i.currentDevicePixelRatio!==t&&e()}))}function Yn(t,e,i){const s=t.canvas,o=s&&eo(s);if(!o)return;const n=Ii((t,e)=>{const s=o.clientWidth;i(t,e),s<o.clientWidth&&i()},window),a=new ResizeObserver(t=>{const e=t[0],i=e.contentRect.width,s=e.contentRect.height;0===i&&0===s||n(i,s)});return a.observe(o),function(t,e){Wn.size||window.addEventListener("resize",Un),Wn.set(t,e)}(t,n),a}function Xn(t,e,i){i&&i.disconnect(),"resize"===e&&function(t){Wn.delete(t),Wn.size||window.removeEventListener("resize",Un)}(t)}function qn(t,e,i){const s=t.canvas,o=Ii(e=>{null!==t.ctx&&i(function(t,e){const i=zn[t.type]||t.type,{x:s,y:o}=ao(t,e);return{type:i,chart:e,native:t,x:void 0!==s?s:null,y:void 0!==o?o:null}}(e,t))},t);return function(t,e,i){t&&t.addEventListener(e,i,Fn)}(s,e,o),o}class Gn extends Tn{acquireContext(t,e){const i=t&&t.getContext&&t.getContext("2d");return i&&i.canvas===t?(function(t,e){const i=t.style,s=t.getAttribute("height"),o=t.getAttribute("width");if(t[Rn]={initial:{height:s,width:o,style:{display:i.display,height:i.height,width:i.width}}},i.display=i.display||"block",i.boxSizing=i.boxSizing||"border-box",In(o)){const e=uo(t,"width");void 0!==e&&(t.width=e)}if(In(s))if(""===t.style.height)t.height=t.width/(e||2);else{const e=uo(t,"height");void 0!==e&&(t.height=e)}}(t,e),i):null}releaseContext(t){const e=t.canvas;if(!e[Rn])return!1;const i=e[Rn].initial;["height","width"].forEach(t=>{const s=i[t];Fe(s)?e.removeAttribute(t):e.setAttribute(t,s)});const s=i.style||{};return Object.keys(s).forEach(t=>{e.style[t]=s[t]}),e.width=e.width,delete e[Rn],!0}addEventListener(t,e,i){this.removeEventListener(t,e);const s=t.$proxies||(t.$proxies={}),o={attach:Nn,detach:Bn,resize:Yn}[e]||qn;s[e]=o(t,e,i)}removeEventListener(t,e){const i=t.$proxies||(t.$proxies={}),s=i[e];if(!s)return;({attach:Xn,detach:Xn,resize:Xn}[e]||Vn)(t,e,s),i[e]=void 0}getDevicePixelRatio(){return window.devicePixelRatio}getMaximumSize(t,e,i,s){return lo(t,e,i,s)}isAttached(t){const e=t&&eo(t);return!(!e||!e.isConnected)}}class Kn{constructor(){s(this,"x"),s(this,"y"),s(this,"active",!1),s(this,"options"),s(this,"$animations")}tooltipPosition(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}hasValue(){return xi(this.x)&&xi(this.y)}getProps(t,e){const i=this.$animations;if(!e||!i)return this;const s={};return t.forEach(t=>{s[t]=i[t]&&i[t].active()?i[t]._to:this[t]}),s}}function Jn(t,e){const i=t.options.ticks,s=function(t){const e=t.options.offset,i=t._tickSize(),s=t._length/i+(e?0:1),o=t._maxLength/i;return Math.floor(Math.min(s,o))}(t),o=Math.min(i.maxTicksLimit||s,s),n=i.major.enabled?function(t){const e=[];let i,s;for(i=0,s=t.length;i<s;i++)t[i].major&&e.push(i);return e}(e):[],a=n.length,r=n[0],l=n[a-1],h=[];if(a>o)return function(t,e,i,s){let o,n=0,a=i[0];for(s=Math.ceil(s),o=0;o<t.length;o++)o===a&&(e.push(t[o]),n++,a=i[n*s])}(e,h,n,a/o),h;const c=function(t,e,i){const s=function(t){const e=t.length;let i,s;if(e<2)return!1;for(s=t[0],i=1;i<e;++i)if(t[i]-t[i-1]!==s)return!1;return s}(t),o=e.length/i;if(!s)return Math.max(o,1);const n=function(t){const e=[],i=Math.sqrt(t);let s;for(s=1;s<i;s++)t%s===0&&(e.push(s),e.push(t/s));return i===(0|i)&&e.push(i),e.sort((t,e)=>t-e).pop(),e}(s);for(let a=0,r=n.length-1;a<r;a++){const t=n[a];if(t>o)return t}return Math.max(o,1)}(n,e,o);if(a>0){let t,i;const s=a>1?Math.round((l-r)/(a-1)):null;for(Zn(e,h,c,Fe(s)?0:r-s,r),t=0,i=a-1;t<i;t++)Zn(e,h,c,n[t],n[t+1]);return Zn(e,h,c,l,Fe(s)?e.length:l+s),h}return Zn(e,h,c),h}function Zn(t,e,i,s,o){const n=We(s,0),a=Math.min(We(o,t.length),t.length);let r,l,h,c=0;for(i=Math.ceil(i),o&&(r=o-s,i=r/Math.floor(r/i)),h=n;h<0;)c++,h=Math.round(n+c*i);for(l=Math.max(n,0);l<a;l++)l===h&&(e.push(t[l]),c++,h=Math.round(n+c*i))}s(Kn,"defaults",{}),s(Kn,"defaultRoutes");const Qn=(t,e,i)=>"top"===e||"left"===e?t[e]+i:t[e]-i,ta=(t,e)=>Math.min(e||t,t);function ea(t,e){const i=[],s=t.length/e,o=t.length;let n=0;for(;n<o;n+=s)i.push(t[Math.floor(n)]);return i}function ia(t,e,i){const s=t.ticks.length,o=Math.min(e,s-1),n=t._startPixel,a=t._endPixel,r=1e-6;let l,h=t.getPixelForTick(o);if(!(i&&(l=1===s?Math.max(h-n,a-h):0===e?(t.getPixelForTick(1)-h)/2:(h-t.getPixelForTick(o-1))/2,h+=o<e?l:-l,h<n-r||h>a+r)))return h}function sa(t){return t.drawTicks?t.tickLength:0}function oa(t,e){if(!t.display)return 0;const i=$s(t.font,e),s=Es(t.padding);return(Ve(t.text)?t.text.length:1)*i.lineHeight+s.height}function na(t,e,i){let s=Fi(t);return(i&&"right"!==e||!i&&"right"===e)&&(s=(t=>"left"===t?"right":"right"===t?"left":t)(s)),s}class aa extends Kn{constructor(t){super(),this.id=t.id,this.type=t.type,this.options=void 0,this.ctx=t.ctx,this.chart=t.chart,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this._margins={left:0,right:0,top:0,bottom:0},this.maxWidth=void 0,this.maxHeight=void 0,this.paddingTop=void 0,this.paddingBottom=void 0,this.paddingLeft=void 0,this.paddingRight=void 0,this.axis=void 0,this.labelRotation=void 0,this.min=void 0,this.max=void 0,this._range=void 0,this.ticks=[],this._gridLineItems=null,this._labelItems=null,this._labelSizes=null,this._length=0,this._maxLength=0,this._longestTextCache={},this._startPixel=void 0,this._endPixel=void 0,this._reversePixels=!1,this._userMax=void 0,this._userMin=void 0,this._suggestedMax=void 0,this._suggestedMin=void 0,this._ticksLength=0,this._borderValue=0,this._cache={},this._dataLimitsCached=!1,this.$context=void 0}init(t){this.options=t.setContext(this.getContext()),this.axis=t.axis,this._userMin=this.parse(t.min),this._userMax=this.parse(t.max),this._suggestedMin=this.parse(t.suggestedMin),this._suggestedMax=this.parse(t.suggestedMax)}parse(t,e){return t}getUserBounds(){let{_userMin:t,_userMax:e,_suggestedMin:i,_suggestedMax:s}=this;return t=Be(t,Number.POSITIVE_INFINITY),e=Be(e,Number.NEGATIVE_INFINITY),i=Be(i,Number.POSITIVE_INFINITY),s=Be(s,Number.NEGATIVE_INFINITY),{min:Be(t,i),max:Be(e,s),minDefined:Ne(t),maxDefined:Ne(e)}}getMinMax(t){let e,{min:i,max:s,minDefined:o,maxDefined:n}=this.getUserBounds();if(o&&n)return{min:i,max:s};const a=this.getMatchingVisibleMetas();for(let r=0,l=a.length;r<l;++r)e=a[r].controller.getMinMax(this,t),o||(i=Math.min(i,e.min)),n||(s=Math.max(s,e.max));return i=n&&i>s?s:i,s=o&&i>s?i:s,{min:Be(i,Be(s,i)),max:Be(s,Be(i,s))}}getPadding(){return{left:this.paddingLeft||0,top:this.paddingTop||0,right:this.paddingRight||0,bottom:this.paddingBottom||0}}getTicks(){return this.ticks}getLabels(){const t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels||[]}getLabelItems(t=this.chart.chartArea){return this._labelItems||(this._labelItems=this._computeLabelItems(t))}beforeLayout(){this._cache={},this._dataLimitsCached=!1}beforeUpdate(){Ue(this.options.beforeUpdate,[this])}update(t,e,i){const{beginAtZero:s,grace:o,ticks:n}=this.options,a=n.sampleSize;this.beforeUpdate(),this.maxWidth=t,this.maxHeight=e,this._margins=i=Object.assign({left:0,right:0,top:0,bottom:0},i),this.ticks=null,this._labelSizes=null,this._gridLineItems=null,this._labelItems=null,this.beforeSetDimensions(),this.setDimensions(),this.afterSetDimensions(),this._maxLength=this.isHorizontal()?this.width+i.left+i.right:this.height+i.top+i.bottom,this._dataLimitsCached||(this.beforeDataLimits(),this.determineDataLimits(),this.afterDataLimits(),this._range=function(t,e,i){const{min:s,max:o}=t,n=je(e,(o-s)/2),a=(t,e)=>i&&0===t?0:t+e;return{min:a(s,-Math.abs(n)),max:a(o,n)}}(this,o,s),this._dataLimitsCached=!0),this.beforeBuildTicks(),this.ticks=this.buildTicks()||[],this.afterBuildTicks();const r=a<this.ticks.length;this._convertTicksToLabels(r?ea(this.ticks,a):this.ticks),this.configure(),this.beforeCalculateLabelRotation(),this.calculateLabelRotation(),this.afterCalculateLabelRotation(),n.display&&(n.autoSkip||"auto"===n.source)&&(this.ticks=Jn(this,this.ticks),this._labelSizes=null,this.afterAutoSkip()),r&&this._convertTicksToLabels(this.ticks),this.beforeFit(),this.fit(),this.afterFit(),this.afterUpdate()}configure(){let t,e,i=this.options.reverse;this.isHorizontal()?(t=this.left,e=this.right):(t=this.top,e=this.bottom,i=!i),this._startPixel=t,this._endPixel=e,this._reversePixels=i,this._length=e-t,this._alignToPixels=this.options.alignToPixels}afterUpdate(){Ue(this.options.afterUpdate,[this])}beforeSetDimensions(){Ue(this.options.beforeSetDimensions,[this])}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=0,this.right=this.width):(this.height=this.maxHeight,this.top=0,this.bottom=this.height),this.paddingLeft=0,this.paddingTop=0,this.paddingRight=0,this.paddingBottom=0}afterSetDimensions(){Ue(this.options.afterSetDimensions,[this])}_callHooks(t){this.chart.notifyPlugins(t,this.getContext()),Ue(this.options[t],[this])}beforeDataLimits(){this._callHooks("beforeDataLimits")}determineDataLimits(){}afterDataLimits(){this._callHooks("afterDataLimits")}beforeBuildTicks(){this._callHooks("beforeBuildTicks")}buildTicks(){return[]}afterBuildTicks(){this._callHooks("afterBuildTicks")}beforeTickToLabelConversion(){Ue(this.options.beforeTickToLabelConversion,[this])}generateTickLabels(t){const e=this.options.ticks;let i,s,o;for(i=0,s=t.length;i<s;i++)o=t[i],o.label=Ue(e.callback,[o.value,i,t],this)}afterTickToLabelConversion(){Ue(this.options.afterTickToLabelConversion,[this])}beforeCalculateLabelRotation(){Ue(this.options.beforeCalculateLabelRotation,[this])}calculateLabelRotation(){const t=this.options,e=t.ticks,i=ta(this.ticks.length,t.ticks.maxTicksLimit),s=e.minRotation||0,o=e.maxRotation;let n,a,r,l=s;if(!this._isVisible()||!e.display||s>=o||i<=1||!this.isHorizontal())return void(this.labelRotation=s);const h=this._getLabelSizes(),c=h.widest.width,d=h.highest.height,u=Ai(this.chart.width-c,0,this.maxWidth);n=t.offset?this.maxWidth/i:u/(i-1),c+6>n&&(n=u/(i-(t.offset?.5:1)),a=this.maxHeight-sa(t.grid)-e.padding-oa(t.title,this.chart.options.font),r=Math.sqrt(c*c+d*d),l=yi(Math.min(Math.asin(Ai((h.highest.height+6)/n,-1,1)),Math.asin(Ai(a/r,-1,1))-Math.asin(Ai(d/r,-1,1)))),l=Math.max(s,Math.min(o,l))),this.labelRotation=l}afterCalculateLabelRotation(){Ue(this.options.afterCalculateLabelRotation,[this])}afterAutoSkip(){}beforeFit(){Ue(this.options.beforeFit,[this])}fit(){const t={width:0,height:0},{chart:e,options:{ticks:i,title:s,grid:o}}=this,n=this._isVisible(),a=this.isHorizontal();if(n){const n=oa(s,e.options.font);if(a?(t.width=this.maxWidth,t.height=sa(o)+n):(t.height=this.maxHeight,t.width=sa(o)+n),i.display&&this.ticks.length){const{first:e,last:s,widest:o,highest:n}=this._getLabelSizes(),r=2*i.padding,l=_i(this.labelRotation),h=Math.cos(l),c=Math.sin(l);if(a){const e=i.mirror?0:c*o.width+h*n.height;t.height=Math.min(this.maxHeight,t.height+e+r)}else{const e=i.mirror?0:h*o.width+c*n.height;t.width=Math.min(this.maxWidth,t.width+e+r)}this._calculatePadding(e,s,c,h)}}this._handleMargins(),a?(this.width=this._length=e.width-this._margins.left-this._margins.right,this.height=t.height):(this.width=t.width,this.height=this._length=e.height-this._margins.top-this._margins.bottom)}_calculatePadding(t,e,i,s){const{ticks:{align:o,padding:n},position:a}=this.options,r=0!==this.labelRotation,l="top"!==a&&"x"===this.axis;if(this.isHorizontal()){const a=this.getPixelForTick(0)-this.left,h=this.right-this.getPixelForTick(this.ticks.length-1);let c=0,d=0;r?l?(c=s*t.width,d=i*e.height):(c=i*t.height,d=s*e.width):"start"===o?d=e.width:"end"===o?c=t.width:"inner"!==o&&(c=t.width/2,d=e.width/2),this.paddingLeft=Math.max((c-a+n)*this.width/(this.width-a),0),this.paddingRight=Math.max((d-h+n)*this.width/(this.width-h),0)}else{let i=e.height/2,s=t.height/2;"start"===o?(i=0,s=t.height):"end"===o&&(i=e.height,s=0),this.paddingTop=i+n,this.paddingBottom=s+n}}_handleMargins(){this._margins&&(this._margins.left=Math.max(this.paddingLeft,this._margins.left),this._margins.top=Math.max(this.paddingTop,this._margins.top),this._margins.right=Math.max(this.paddingRight,this._margins.right),this._margins.bottom=Math.max(this.paddingBottom,this._margins.bottom))}afterFit(){Ue(this.options.afterFit,[this])}isHorizontal(){const{axis:t,position:e}=this.options;return"top"===e||"bottom"===e||"x"===t}isFullSize(){return this.options.fullSize}_convertTicksToLabels(t){let e,i;for(this.beforeTickToLabelConversion(),this.generateTickLabels(t),e=0,i=t.length;e<i;e++)Fe(t[e].label)&&(t.splice(e,1),i--,e--);this.afterTickToLabelConversion()}_getLabelSizes(){let t=this._labelSizes;if(!t){const e=this.options.ticks.sampleSize;let i=this.ticks;e<i.length&&(i=ea(i,e)),this._labelSizes=t=this._computeLabelSizes(i,i.length,this.options.ticks.maxTicksLimit)}return t}_computeLabelSizes(t,e,i){const{ctx:s,_longestTextCache:o}=this,n=[],a=[],r=Math.floor(e/ta(e,i));let l,h,c,d,u,p,g,f,m,b,x,v=0,_=0;for(l=0;l<e;l+=r){if(d=t[l].label,u=this._resolveTickFontOptions(l),s.font=p=u.string,g=o[p]=o[p]||{data:{},gc:[]},f=u.lineHeight,m=b=0,Fe(d)||Ve(d)){if(Ve(d))for(h=0,c=d.length;h<c;++h)x=d[h],Fe(x)||Ve(x)||(m=rs(s,g.data,g.gc,m,x),b+=f)}else m=rs(s,g.data,g.gc,m,d),b=f;n.push(m),a.push(b),v=Math.max(m,v),_=Math.max(b,_)}!function(t,e){Ye(t,t=>{const i=t.gc,s=i.length/2;let o;if(s>e){for(o=0;o<s;++o)delete t.data[i[o]];i.splice(0,s)}})}(o,e);const y=n.indexOf(v),w=a.indexOf(_),k=t=>({width:n[t]||0,height:a[t]||0});return{first:k(0),last:k(e-1),widest:k(y),highest:k(w),widths:n,heights:a}}getLabelForValue(t){return t}getPixelForValue(t,e){return NaN}getValueForPixel(t){}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getPixelForDecimal(t){this._reversePixels&&(t=1-t);const e=this._startPixel+t*this._length;return Ai(this._alignToPixels?hs(this.chart,e,0):e,-32768,32767)}getDecimalForPixel(t){const e=(t-this._startPixel)/this._length;return this._reversePixels?1-e:e}getBasePixel(){return this.getPixelForValue(this.getBaseValue())}getBaseValue(){const{min:t,max:e}=this;return t<0&&e<0?e:t>0&&e>0?t:0}getContext(t){const e=this.ticks||[];if(t>=0&&t<e.length){const i=e[t];return i.$context||(i.$context=function(t,e,i){return Os(t,{tick:i,index:e,type:"tick"})}(this.getContext(),t,i))}return this.$context||(this.$context=Os(this.chart.getContext(),{scale:this,type:"scale"}))}_tickSize(){const t=this.options.ticks,e=_i(this.labelRotation),i=Math.abs(Math.cos(e)),s=Math.abs(Math.sin(e)),o=this._getLabelSizes(),n=t.autoSkipPadding||0,a=o?o.widest.width+n:0,r=o?o.highest.height+n:0;return this.isHorizontal()?r*i>a*s?a/i:r/s:r*s<a*i?r/i:a/s}_isVisible(){const t=this.options.display;return"auto"!==t?!!t:this.getMatchingVisibleMetas().length>0}_computeGridLineItems(t){const e=this.axis,i=this.chart,s=this.options,{grid:o,position:n,border:a}=s,r=o.offset,l=this.isHorizontal(),h=this.ticks.length+(r?1:0),c=sa(o),d=[],u=a.setContext(this.getContext()),p=u.display?u.width:0,g=p/2,f=function(t){return hs(i,t,p)};let m,b,x,v,_,y,w,k,C,M,S,P;if("top"===n)m=f(this.bottom),y=this.bottom-c,k=m-g,M=f(t.top)+g,P=t.bottom;else if("bottom"===n)m=f(this.top),M=t.top,P=f(t.bottom)-g,y=m+g,k=this.top+c;else if("left"===n)m=f(this.right),_=this.right-c,w=m-g,C=f(t.left)+g,S=t.right;else if("right"===n)m=f(this.left),C=t.left,S=f(t.right)-g,_=m+g,w=this.left+c;else if("x"===e){if("center"===n)m=f((t.top+t.bottom)/2+.5);else if(He(n)){const t=Object.keys(n)[0],e=n[t];m=f(this.chart.scales[t].getPixelForValue(e))}M=t.top,P=t.bottom,y=m+g,k=y+c}else if("y"===e){if("center"===n)m=f((t.left+t.right)/2);else if(He(n)){const t=Object.keys(n)[0],e=n[t];m=f(this.chart.scales[t].getPixelForValue(e))}_=m-g,w=_-c,C=t.left,S=t.right}const A=We(s.ticks.maxTicksLimit,h),E=Math.max(1,Math.ceil(h/A));for(b=0;b<h;b+=E){const t=this.getContext(b),e=o.setContext(t),s=a.setContext(t),n=e.lineWidth,h=e.color,c=s.dash||[],u=s.dashOffset,p=e.tickWidth,g=e.tickColor,f=e.tickBorderDash||[],m=e.tickBorderDashOffset;x=ia(this,b,r),void 0!==x&&(v=hs(i,x,n),l?_=w=C=S=v:y=k=M=P=v,d.push({tx1:_,ty1:y,tx2:w,ty2:k,x1:C,y1:M,x2:S,y2:P,width:n,color:h,borderDash:c,borderDashOffset:u,tickWidth:p,tickColor:g,tickBorderDash:f,tickBorderDashOffset:m}))}return this._ticksLength=h,this._borderValue=m,d}_computeLabelItems(t){const e=this.axis,i=this.options,{position:s,ticks:o}=i,n=this.isHorizontal(),a=this.ticks,{align:r,crossAlign:l,padding:h,mirror:c}=o,d=sa(i.grid),u=d+h,p=c?-h:u,g=-_i(this.labelRotation),f=[];let m,b,x,v,_,y,w,k,C,M,S,P,A="middle";if("top"===s)y=this.bottom-p,w=this._getXAxisLabelAlignment();else if("bottom"===s)y=this.top+p,w=this._getXAxisLabelAlignment();else if("left"===s){const t=this._getYAxisLabelAlignment(d);w=t.textAlign,_=t.x}else if("right"===s){const t=this._getYAxisLabelAlignment(d);w=t.textAlign,_=t.x}else if("x"===e){if("center"===s)y=(t.top+t.bottom)/2+u;else if(He(s)){const t=Object.keys(s)[0],e=s[t];y=this.chart.scales[t].getPixelForValue(e)+u}w=this._getXAxisLabelAlignment()}else if("y"===e){if("center"===s)_=(t.left+t.right)/2-u;else if(He(s)){const t=Object.keys(s)[0],e=s[t];_=this.chart.scales[t].getPixelForValue(e)}w=this._getYAxisLabelAlignment(d).textAlign}"y"===e&&("start"===r?A="top":"end"===r&&(A="bottom"));const E=this._getLabelSizes();for(m=0,b=a.length;m<b;++m){x=a[m],v=x.label;const t=o.setContext(this.getContext(m));k=this.getPixelForTick(m)+o.labelOffset,C=this._resolveTickFontOptions(m),M=C.lineHeight,S=Ve(v)?v.length:1;const e=S/2,i=t.color,r=t.textStrokeColor,h=t.textStrokeWidth;let d,u=w;if(n?(_=k,"inner"===w&&(u=m===b-1?this.options.reverse?"left":"right":0===m?this.options.reverse?"right":"left":"center"),P="top"===s?"near"===l||0!==g?-S*M+M/2:"center"===l?-E.highest.height/2-e*M+M:-E.highest.height+M/2:"near"===l||0!==g?M/2:"center"===l?E.highest.height/2-e*M:E.highest.height-S*M,c&&(P*=-1),0===g||t.showLabelBackdrop||(_+=M/2*Math.sin(g))):(y=k,P=(1-S)*M/2),t.showLabelBackdrop){const e=Es(t.backdropPadding),i=E.heights[m],s=E.widths[m];let o=P-e.top,n=0-e.left;switch(A){case"middle":o-=i/2;break;case"bottom":o-=i}switch(w){case"center":n-=s/2;break;case"right":n-=s;break;case"inner":m===b-1?n-=s:m>0&&(n-=s/2)}d={left:n,top:o,width:s+e.width,height:i+e.height,color:t.backdropColor}}f.push({label:v,font:C,textOffset:P,options:{rotation:g,color:i,strokeColor:r,strokeWidth:h,textAlign:u,textBaseline:A,translation:[_,y],backdrop:d}})}return f}_getXAxisLabelAlignment(){const{position:t,ticks:e}=this.options;if(-_i(this.labelRotation))return"top"===t?"left":"right";let i="center";return"start"===e.align?i="left":"end"===e.align?i="right":"inner"===e.align&&(i="inner"),i}_getYAxisLabelAlignment(t){const{position:e,ticks:{crossAlign:i,mirror:s,padding:o}}=this.options,n=t+o,a=this._getLabelSizes().widest.width;let r,l;return"left"===e?s?(l=this.right+o,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l+=a)):(l=this.right-n,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l=this.left)):"right"===e?s?(l=this.left+o,"near"===i?r="right":"center"===i?(r="center",l-=a/2):(r="left",l-=a)):(l=this.left+n,"near"===i?r="left":"center"===i?(r="center",l+=a/2):(r="right",l=this.right)):r="right",{textAlign:r,x:l}}_computeLabelArea(){if(this.options.ticks.mirror)return;const t=this.chart,e=this.options.position;return"left"===e||"right"===e?{top:0,left:this.left,bottom:t.height,right:this.right}:"top"===e||"bottom"===e?{top:this.top,left:0,bottom:this.bottom,right:t.width}:void 0}drawBackground(){const{ctx:t,options:{backgroundColor:e},left:i,top:s,width:o,height:n}=this;e&&(t.save(),t.fillStyle=e,t.fillRect(i,s,o,n),t.restore())}getLineWidthForValue(t){const e=this.options.grid;if(!this._isVisible()||!e.display)return 0;const i=this.ticks.findIndex(e=>e.value===t);if(i>=0){return e.setContext(this.getContext(i)).lineWidth}return 0}drawGrid(t){const e=this.options.grid,i=this.ctx,s=this._gridLineItems||(this._gridLineItems=this._computeGridLineItems(t));let o,n;const a=(t,e,s)=>{s.width&&s.color&&(i.save(),i.lineWidth=s.width,i.strokeStyle=s.color,i.setLineDash(s.borderDash||[]),i.lineDashOffset=s.borderDashOffset,i.beginPath(),i.moveTo(t.x,t.y),i.lineTo(e.x,e.y),i.stroke(),i.restore())};if(e.display)for(o=0,n=s.length;o<n;++o){const t=s[o];e.drawOnChartArea&&a({x:t.x1,y:t.y1},{x:t.x2,y:t.y2},t),e.drawTicks&&a({x:t.tx1,y:t.ty1},{x:t.tx2,y:t.ty2},{color:t.tickColor,width:t.tickWidth,borderDash:t.tickBorderDash,borderDashOffset:t.tickBorderDashOffset})}}drawBorder(){const{chart:t,ctx:e,options:{border:i,grid:s}}=this,o=i.setContext(this.getContext()),n=i.display?o.width:0;if(!n)return;const a=s.setContext(this.getContext(0)).lineWidth,r=this._borderValue;let l,h,c,d;this.isHorizontal()?(l=hs(t,this.left,n)-n/2,h=hs(t,this.right,a)+a/2,c=d=r):(c=hs(t,this.top,n)-n/2,d=hs(t,this.bottom,a)+a/2,l=h=r),e.save(),e.lineWidth=o.width,e.strokeStyle=o.color,e.beginPath(),e.moveTo(l,c),e.lineTo(h,d),e.stroke(),e.restore()}drawLabels(t){if(!this.options.ticks.display)return;const e=this.ctx,i=this._computeLabelArea();i&&gs(e,i);const s=this.getLabelItems(t);for(const o of s){const t=o.options,i=o.font;_s(e,o.label,0,o.textOffset,i,t)}i&&fs(e)}drawTitle(){const{ctx:t,options:{position:e,title:i,reverse:s}}=this;if(!i.display)return;const o=$s(i.font),n=Es(i.padding),a=i.align;let r=o.lineHeight/2;"bottom"===e||"center"===e||He(e)?(r+=n.bottom,Ve(i.text)&&(r+=o.lineHeight*(i.text.length-1))):r+=n.top;const{titleX:l,titleY:h,maxWidth:c,rotation:d}=function(t,e,i,s){const{top:o,left:n,bottom:a,right:r,chart:l}=t,{chartArea:h,scales:c}=l;let d,u,p,g=0;const f=a-o,m=r-n;if(t.isHorizontal()){if(u=Vi(s,n,r),He(i)){const t=Object.keys(i)[0],s=i[t];p=c[t].getPixelForValue(s)+f-e}else p="center"===i?(h.bottom+h.top)/2+f-e:Qn(t,i,e);d=r-n}else{if(He(i)){const t=Object.keys(i)[0],s=i[t];u=c[t].getPixelForValue(s)-m+e}else u="center"===i?(h.left+h.right)/2-m+e:Qn(t,i,e);p=Vi(s,a,o),g="left"===i?-di:di}return{titleX:u,titleY:p,maxWidth:d,rotation:g}}(this,r,e,a);_s(t,i.text,0,0,o,{color:i.color,maxWidth:c,rotation:d,textAlign:na(a,e,s),textBaseline:"middle",translation:[l,h]})}draw(t){this._isVisible()&&(this.drawBackground(),this.drawGrid(t),this.drawBorder(),this.drawTitle(),this.drawLabels(t))}_layers(){const t=this.options,e=t.ticks&&t.ticks.z||0,i=We(t.grid&&t.grid.z,-1),s=We(t.border&&t.border.z,0);return this._isVisible()&&this.draw===aa.prototype.draw?[{z:i,draw:t=>{this.drawBackground(),this.drawGrid(t),this.drawTitle()}},{z:s,draw:()=>{this.drawBorder()}},{z:e,draw:t=>{this.drawLabels(t)}}]:[{z:e,draw:t=>{this.draw(t)}}]}getMatchingVisibleMetas(t){const e=this.chart.getSortedVisibleDatasetMetas(),i=this.axis+"AxisID",s=[];let o,n;for(o=0,n=e.length;o<n;++o){const n=e[o];n[i]!==this.id||t&&n.type!==t||s.push(n)}return s}_resolveTickFontOptions(t){return $s(this.options.ticks.setContext(this.getContext(t)).font)}_maxDigits(){const t=this._resolveTickFontOptions(0).lineHeight;return(this.isHorizontal()?this.width:this.height)/t}}class ra{constructor(t,e,i){this.type=t,this.scope=e,this.override=i,this.items=Object.create(null)}isForType(t){return Object.prototype.isPrototypeOf.call(this.type.prototype,t.prototype)}register(t){const e=Object.getPrototypeOf(t);let i;(function(t){return"id"in t&&"defaults"in t})(e)&&(i=this.register(e));const s=this.items,o=t.id,n=this.scope+"."+o;if(!o)throw new Error("class does not have id: "+t);return o in s||(s[o]=t,function(t,e,i){const s=Je(Object.create(null),[i?as.get(i):{},as.get(e),t.defaults]);as.set(e,s),t.defaultRoutes&&function(t,e){Object.keys(e).forEach(i=>{const s=i.split("."),o=s.pop(),n=[t].concat(s).join("."),a=e[i].split("."),r=a.pop(),l=a.join(".");as.route(n,o,l,r)})}(e,t.defaultRoutes);t.descriptors&&as.describe(e,t.descriptors)}(t,n,i),this.override&&as.override(t.id,t.overrides)),n}get(t){return this.items[t]}unregister(t){const e=this.items,i=t.id,s=this.scope;i in e&&delete e[i],s&&i in as[s]&&(delete as[s][i],this.override&&delete es[i])}}class la{constructor(){this.controllers=new ra(Uo,"datasets",!0),this.elements=new ra(Kn,"elements"),this.plugins=new ra(Object,"plugins"),this.scales=new ra(aa,"scales"),this._typedRegistries=[this.controllers,this.scales,this.elements]}add(...t){this._each("register",t)}remove(...t){this._each("unregister",t)}addControllers(...t){this._each("register",t,this.controllers)}addElements(...t){this._each("register",t,this.elements)}addPlugins(...t){this._each("register",t,this.plugins)}addScales(...t){this._each("register",t,this.scales)}getController(t){return this._get(t,this.controllers,"controller")}getElement(t){return this._get(t,this.elements,"element")}getPlugin(t){return this._get(t,this.plugins,"plugin")}getScale(t){return this._get(t,this.scales,"scale")}removeControllers(...t){this._each("unregister",t,this.controllers)}removeElements(...t){this._each("unregister",t,this.elements)}removePlugins(...t){this._each("unregister",t,this.plugins)}removeScales(...t){this._each("unregister",t,this.scales)}_each(t,e,i){[...e].forEach(e=>{const s=i||this._getRegistryForType(e);i||s.isForType(e)||s===this.plugins&&e.id?this._exec(t,s,e):Ye(e,e=>{const s=i||this._getRegistryForType(e);this._exec(t,s,e)})})}_exec(t,e,i){const s=ii(t);Ue(i["before"+s],[],i),e[t](i),Ue(i["after"+s],[],i)}_getRegistryForType(t){for(let e=0;e<this._typedRegistries.length;e++){const i=this._typedRegistries[e];if(i.isForType(t))return i}return this.plugins}_get(t,e,i){const s=e.get(t);if(void 0===s)throw new Error('"'+t+'" is not a registered '+i+".");return s}}var ha=new la;class ca{constructor(){this._init=void 0}notify(t,e,i,s){if("beforeInit"===e&&(this._init=this._createDescriptors(t,!0),this._notify(this._init,t,"install")),void 0===this._init)return;const o=s?this._descriptors(t).filter(s):this._descriptors(t),n=this._notify(o,t,e,i);return"afterDestroy"===e&&(this._notify(o,t,"stop"),this._notify(this._init,t,"uninstall"),this._init=void 0),n}_notify(t,e,i,s){s=s||{};for(const o of t){const t=o.plugin;if(!1===Ue(t[i],[e,s,o.options],t)&&s.cancelable)return!1}return!0}invalidate(){Fe(this._cache)||(this._oldCache=this._cache,this._cache=void 0)}_descriptors(t){if(this._cache)return this._cache;const e=this._cache=this._createDescriptors(t);return this._notifyStateChanges(t),e}_createDescriptors(t,e){const i=t&&t.config,s=We(i.options&&i.options.plugins,{}),o=function(t){const e={},i=[],s=Object.keys(ha.plugins.items);for(let n=0;n<s.length;n++)i.push(ha.getPlugin(s[n]));const o=t.plugins||[];for(let n=0;n<o.length;n++){const t=o[n];-1===i.indexOf(t)&&(i.push(t),e[t.id]=!0)}return{plugins:i,localIds:e}}(i);return!1!==s||e?function(t,{plugins:e,localIds:i},s,o){const n=[],a=t.getContext();for(const r of e){const e=r.id,l=da(s[e],o);null!==l&&n.push({plugin:r,options:ua(t.config,{plugin:r,local:i[e]},l,a)})}return n}(t,o,s,e):[]}_notifyStateChanges(t){const e=this._oldCache||[],i=this._cache,s=(t,e)=>t.filter(t=>!e.some(e=>t.plugin.id===e.plugin.id));this._notify(s(e,i),t,"stop"),this._notify(s(i,e),t,"start")}}function da(t,e){return e||!1!==t?!0===t?{}:t:null}function ua(t,{plugin:e,local:i},s,o){const n=t.pluginScopeKeys(e),a=t.getOptionScopes(s,n);return i&&e.defaults&&a.push(e.defaults),t.createResolver(a,o,[""],{scriptable:!1,indexable:!1,allKeys:!0})}function pa(t,e){const i=as.datasets[t]||{};return((e.datasets||{})[t]||{}).indexAxis||e.indexAxis||i.indexAxis||"x"}function ga(t){if("x"===t||"y"===t||"r"===t)return t}function fa(t){return"top"===t||"bottom"===t?"x":"left"===t||"right"===t?"y":void 0}function ma(t,...e){if(ga(t))return t;for(const i of e){const e=i.axis||fa(i.position)||t.length>1&&ga(t[0].toLowerCase());if(e)return e}throw new Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`)}function ba(t,e,i){if(i[e+"AxisID"]===t)return{axis:e}}function xa(t,e){const i=es[t.type]||{scales:{}},s=e.scales||{},o=pa(t.type,e),n=Object.create(null);return Object.keys(s).forEach(e=>{const a=s[e];if(!He(a))return console.error(`Invalid scale configuration for scale: ${e}`);if(a._proxy)return console.warn(`Ignoring resolver passed as options for scale: ${e}`);const r=ma(e,a,function(t,e){if(e.data&&e.data.datasets){const i=e.data.datasets.filter(e=>e.xAxisID===t||e.yAxisID===t);if(i.length)return ba(t,"x",i[0])||ba(t,"y",i[0])}return{}}(e,t),as.scales[a.type]),l=function(t,e){return t===e?"_index_":"_value_"}(r,o),h=i.scales||{};n[e]=Ze(Object.create(null),[{axis:r},a,h[r],h[l]])}),t.data.datasets.forEach(i=>{const o=i.type||t.type,a=i.indexAxis||pa(o,e),r=(es[o]||{}).scales||{};Object.keys(r).forEach(t=>{const e=function(t,e){let i=t;return"_index_"===t?i=e:"_value_"===t&&(i="x"===e?"y":"x"),i}(t,a),o=i[e+"AxisID"]||e;n[o]=n[o]||Object.create(null),Ze(n[o],[{axis:e},s[o],r[t]])})}),Object.keys(n).forEach(t=>{const e=n[t];Ze(e,[as.scales[e.type],as.scale])}),n}function va(t){const e=t.options||(t.options={});e.plugins=We(e.plugins,{}),e.scales=xa(t,e)}function _a(t){return(t=t||{}).datasets=t.datasets||[],t.labels=t.labels||[],t}const ya=new Map,wa=new Set;function ka(t,e){let i=ya.get(t);return i||(i=e(),ya.set(t,i),wa.add(i)),i}const Ca=(t,e,i)=>{const s=ei(e,i);void 0!==s&&t.add(s)};class Ma{constructor(t){this._config=function(t){return(t=t||{}).data=_a(t.data),va(t),t}(t),this._scopeCache=new Map,this._resolverCache=new Map}get platform(){return this._config.platform}get type(){return this._config.type}set type(t){this._config.type=t}get data(){return this._config.data}set data(t){this._config.data=_a(t)}get options(){return this._config.options}set options(t){this._config.options=t}get plugins(){return this._config.plugins}update(){const t=this._config;this.clearCache(),va(t)}clearCache(){this._scopeCache.clear(),this._resolverCache.clear()}datasetScopeKeys(t){return ka(t,()=>[[`datasets.${t}`,""]])}datasetAnimationScopeKeys(t,e){return ka(`${t}.transition.${e}`,()=>[[`datasets.${t}.transitions.${e}`,`transitions.${e}`],[`datasets.${t}`,""]])}datasetElementScopeKeys(t,e){return ka(`${t}-${e}`,()=>[[`datasets.${t}.elements.${e}`,`datasets.${t}`,`elements.${e}`,""]])}pluginScopeKeys(t){const e=t.id;return ka(`${this.type}-plugin-${e}`,()=>[[`plugins.${e}`,...t.additionalOptionScopes||[]]])}_cachedScopes(t,e){const i=this._scopeCache;let s=i.get(t);return s&&!e||(s=new Map,i.set(t,s)),s}getOptionScopes(t,e,i){const{options:s,type:o}=this,n=this._cachedScopes(t,i),a=n.get(e);if(a)return a;const r=new Set;e.forEach(e=>{t&&(r.add(t),e.forEach(e=>Ca(r,t,e))),e.forEach(t=>Ca(r,s,t)),e.forEach(t=>Ca(r,es[o]||{},t)),e.forEach(t=>Ca(r,as,t)),e.forEach(t=>Ca(r,is,t))});const l=Array.from(r);return 0===l.length&&l.push(Object.create(null)),wa.has(e)&&n.set(e,l),l}chartOptionScopes(){const{options:t,type:e}=this;return[t,es[e]||{},as.datasets[e]||{},{type:e},as,is]}resolveNamedOptions(t,e,i,s=[""]){const o={$shared:!0},{resolver:n,subPrefixes:a}=Sa(this._resolverCache,t,s);let r=n;if(function(t,e){const{isScriptable:i,isIndexable:s}=Rs(t);for(const o of e){const e=i(o),n=s(o),a=(n||e)&&t[o];if(e&&(oi(a)||Pa(a))||n&&Ve(a))return!0}return!1}(n,e)){o.$shared=!1;r=Ls(n,i=oi(i)?i():i,this.createResolver(t,i,a))}for(const l of e)o[l]=r[l];return o}createResolver(t,e,i=[""],s){const{resolver:o}=Sa(this._resolverCache,t,i);return He(e)?Ls(o,e,void 0,s):o}}function Sa(t,e,i){let s=t.get(e);s||(s=new Map,t.set(e,s));const o=i.join();let n=s.get(o);if(!n){n={resolver:Ts(e,i),subPrefixes:i.filter(t=>!t.toLowerCase().includes("hover"))},s.set(o,n)}return n}const Pa=t=>He(t)&&Object.getOwnPropertyNames(t).some(e=>oi(t[e]));const Aa=["top","bottom","left","right","chartArea"];function Ea(t,e){return"top"===t||"bottom"===t||-1===Aa.indexOf(t)&&"x"===e}function $a(t,e){return function(i,s){return i[t]===s[t]?i[e]-s[e]:i[t]-s[t]}}function Da(t){const e=t.chart,i=e.options.animation;e.notifyPlugins("afterRender"),Ue(i&&i.onComplete,[t],e)}function Oa(t){const e=t.chart,i=e.options.animation;Ue(i&&i.onProgress,[t],e)}function Ta(t){return to()&&"string"==typeof t?t=document.getElementById(t):t&&t.length&&(t=t[0]),t&&t.canvas&&(t=t.canvas),t}const La={},Ra=t=>{const e=Ta(t);return Object.values(La).filter(t=>t.canvas===e).pop()};function za(t,e,i){const s=Object.keys(t);for(const o of s){const s=+o;if(s>=e){const n=t[o];delete t[o],(i>0||s>e)&&(t[s+i]=n)}}}class Ia{static register(...t){ha.add(...t),Fa()}static unregister(...t){ha.remove(...t),Fa()}constructor(t,e){const i=this.config=new Ma(e),s=Ta(t),o=Ra(s);if(o)throw new Error("Canvas is already in use. Chart with ID '"+o.id+"' must be destroyed before the canvas with ID '"+o.canvas.id+"' can be reused.");const n=i.createResolver(i.chartOptionScopes(),this.getContext());this.platform=new(i.platform||function(t){return!to()||"undefined"!=typeof OffscreenCanvas&&t instanceof OffscreenCanvas?Ln:Gn}(s)),this.platform.updateConfig(i);const a=this.platform.acquireContext(s,n.aspectRatio),r=a&&a.canvas,l=r&&r.height,h=r&&r.width;this.id=Ie(),this.ctx=a,this.canvas=r,this.width=h,this.height=l,this._options=n,this._aspectRatio=this.aspectRatio,this._layers=[],this._metasets=[],this._stacks=void 0,this.boxes=[],this.currentDevicePixelRatio=void 0,this.chartArea=void 0,this._active=[],this._lastEvent=void 0,this._listeners={},this._responsiveListeners=void 0,this._sortedMetasets=[],this.scales={},this._plugins=new ca,this.$proxies={},this._hiddenIndices={},this.attached=!1,this._animationsDisabled=void 0,this.$context=void 0,this._doResize=function(t,e){let i;return function(...s){return e?(clearTimeout(i),i=setTimeout(t,e,s)):t.apply(this,s),e}}(t=>this.update(t),n.resizeDelay||0),this._dataChanges=[],La[this.id]=this,a&&r?(Eo.listen(this,"complete",Da),Eo.listen(this,"progress",Oa),this._initialize(),this.attached&&this.update()):console.error("Failed to create chart: can't acquire context from the given item")}get aspectRatio(){const{options:{aspectRatio:t,maintainAspectRatio:e},width:i,height:s,_aspectRatio:o}=this;return Fe(t)?e&&o?o:s?i/s:null:t}get data(){return this.config.data}set data(t){this.config.data=t}get options(){return this._options}set options(t){this.config.options=t}get registry(){return ha}_initialize(){return this.notifyPlugins("beforeInit"),this.options.responsive?this.resize():ho(this,this.options.devicePixelRatio),this.bindEvents(),this.notifyPlugins("afterInit"),this}clear(){return cs(this.canvas,this.ctx),this}stop(){return Eo.stop(this),this}resize(t,e){Eo.running(this)?this._resizeBeforeDraw={width:t,height:e}:this._resize(t,e)}_resize(t,e){const i=this.options,s=this.canvas,o=i.maintainAspectRatio&&this.aspectRatio,n=this.platform.getMaximumSize(s,t,e,o),a=i.devicePixelRatio||this.platform.getDevicePixelRatio(),r=this.width?"resize":"attach";this.width=n.width,this.height=n.height,this._aspectRatio=this.aspectRatio,ho(this,a,!0)&&(this.notifyPlugins("resize",{size:n}),Ue(i.onResize,[this,n],this),this.attached&&this._doResize(r)&&this.render())}ensureScalesHaveIDs(){Ye(this.options.scales||{},(t,e)=>{t.id=e})}buildOrUpdateScales(){const t=this.options,e=t.scales,i=this.scales,s=Object.keys(i).reduce((t,e)=>(t[e]=!1,t),{});let o=[];e&&(o=o.concat(Object.keys(e).map(t=>{const i=e[t],s=ma(t,i),o="r"===s,n="x"===s;return{options:i,dposition:o?"chartArea":n?"bottom":"left",dtype:o?"radialLinear":n?"category":"linear"}}))),Ye(o,e=>{const o=e.options,n=o.id,a=ma(n,o),r=We(o.type,e.dtype);void 0!==o.position&&Ea(o.position,a)===Ea(e.dposition)||(o.position=e.dposition),s[n]=!0;let l=null;if(n in i&&i[n].type===r)l=i[n];else{l=new(ha.getScale(r))({id:n,type:r,ctx:this.ctx,chart:this}),i[l.id]=l}l.init(o,t)}),Ye(s,(t,e)=>{t||delete i[e]}),Ye(i,t=>{On.configure(this,t,t.options),On.addBox(this,t)})}_updateMetasets(){const t=this._metasets,e=this.data.datasets.length,i=t.length;if(t.sort((t,e)=>t.index-e.index),i>e){for(let t=e;t<i;++t)this._destroyDatasetMeta(t);t.splice(e,i-e)}this._sortedMetasets=t.slice(0).sort($a("order","index"))}_removeUnreferencedMetasets(){const{_metasets:t,data:{datasets:e}}=this;t.length>e.length&&delete this._stacks,t.forEach((t,i)=>{0===e.filter(e=>e===t._dataset).length&&this._destroyDatasetMeta(i)})}buildOrUpdateControllers(){const t=[],e=this.data.datasets;let i,s;for(this._removeUnreferencedMetasets(),i=0,s=e.length;i<s;i++){const s=e[i];let o=this.getDatasetMeta(i);const n=s.type||this.config.type;if(o.type&&o.type!==n&&(this._destroyDatasetMeta(i),o=this.getDatasetMeta(i)),o.type=n,o.indexAxis=s.indexAxis||pa(n,this.options),o.order=s.order||0,o.index=i,o.label=""+s.label,o.visible=this.isDatasetVisible(i),o.controller)o.controller.updateIndex(i),o.controller.linkScales();else{const e=ha.getController(n),{datasetElementType:s,dataElementType:a}=as.datasets[n];Object.assign(e,{dataElementType:ha.getElement(a),datasetElementType:s&&ha.getElement(s)}),o.controller=new e(this,i),t.push(o.controller)}}return this._updateMetasets(),t}_resetElements(){Ye(this.data.datasets,(t,e)=>{this.getDatasetMeta(e).controller.reset()},this)}reset(){this._resetElements(),this.notifyPlugins("reset")}update(t){const e=this.config;e.update();const i=this._options=e.createResolver(e.chartOptionScopes(),this.getContext()),s=this._animationsDisabled=!i.animation;if(this._updateScales(),this._checkEventBindings(),this._updateHiddenIndices(),this._plugins.invalidate(),!1===this.notifyPlugins("beforeUpdate",{mode:t,cancelable:!0}))return;const o=this.buildOrUpdateControllers();this.notifyPlugins("beforeElementsUpdate");let n=0;for(let l=0,h=this.data.datasets.length;l<h;l++){const{controller:t}=this.getDatasetMeta(l),e=!s&&-1===o.indexOf(t);t.buildOrUpdateElements(e),n=Math.max(+t.getMaxOverflow(),n)}n=this._minPadding=i.layout.autoPadding?n:0,this._updateLayout(n),s||Ye(o,t=>{t.reset()}),this._updateDatasets(t),this.notifyPlugins("afterUpdate",{mode:t}),this._layers.sort($a("z","_idx"));const{_active:a,_lastEvent:r}=this;r?this._eventHandler(r,!0):a.length&&this._updateHoverStyles(a,a,!0),this.render()}_updateScales(){Ye(this.scales,t=>{On.removeBox(this,t)}),this.ensureScalesHaveIDs(),this.buildOrUpdateScales()}_checkEventBindings(){const t=this.options,e=new Set(Object.keys(this._listeners)),i=new Set(t.events);ni(e,i)&&!!this._responsiveListeners===t.responsive||(this.unbindEvents(),this.bindEvents())}_updateHiddenIndices(){const{_hiddenIndices:t}=this,e=this._getUniformDataChanges()||[];for(const{method:i,start:s,count:o}of e){za(t,s,"_removeElements"===i?-o:o)}}_getUniformDataChanges(){const t=this._dataChanges;if(!t||!t.length)return;this._dataChanges=[];const e=this.data.datasets.length,i=e=>new Set(t.filter(t=>t[0]===e).map((t,e)=>e+","+t.splice(1).join(","))),s=i(0);for(let o=1;o<e;o++)if(!ni(s,i(o)))return;return Array.from(s).map(t=>t.split(",")).map(t=>({method:t[1],start:+t[2],count:+t[3]}))}_updateLayout(t){if(!1===this.notifyPlugins("beforeLayout",{cancelable:!0}))return;On.update(this,this.width,this.height,t);const e=this.chartArea,i=e.width<=0||e.height<=0;this._layers=[],Ye(this.boxes,t=>{i&&"chartArea"===t.position||(t.configure&&t.configure(),this._layers.push(...t._layers()))},this),this._layers.forEach((t,e)=>{t._idx=e}),this.notifyPlugins("afterLayout")}_updateDatasets(t){if(!1!==this.notifyPlugins("beforeDatasetsUpdate",{mode:t,cancelable:!0})){for(let t=0,e=this.data.datasets.length;t<e;++t)this.getDatasetMeta(t).controller.configure();for(let e=0,i=this.data.datasets.length;e<i;++e)this._updateDataset(e,oi(t)?t({datasetIndex:e}):t);this.notifyPlugins("afterDatasetsUpdate",{mode:t})}}_updateDataset(t,e){const i=this.getDatasetMeta(t),s={meta:i,index:t,mode:e,cancelable:!0};!1!==this.notifyPlugins("beforeDatasetUpdate",s)&&(i.controller._update(e),s.cancelable=!1,this.notifyPlugins("afterDatasetUpdate",s))}render(){!1!==this.notifyPlugins("beforeRender",{cancelable:!0})&&(Eo.has(this)?this.attached&&!Eo.running(this)&&Eo.start(this):(this.draw(),Da({chart:this})))}draw(){let t;if(this._resizeBeforeDraw){const{width:t,height:e}=this._resizeBeforeDraw;this._resizeBeforeDraw=null,this._resize(t,e)}if(this.clear(),this.width<=0||this.height<=0)return;if(!1===this.notifyPlugins("beforeDraw",{cancelable:!0}))return;const e=this._layers;for(t=0;t<e.length&&e[t].z<=0;++t)e[t].draw(this.chartArea);for(this._drawDatasets();t<e.length;++t)e[t].draw(this.chartArea);this.notifyPlugins("afterDraw")}_getSortedDatasetMetas(t){const e=this._sortedMetasets,i=[];let s,o;for(s=0,o=e.length;s<o;++s){const o=e[s];t&&!o.visible||i.push(o)}return i}getSortedVisibleDatasetMetas(){return this._getSortedDatasetMetas(!0)}_drawDatasets(){if(!1===this.notifyPlugins("beforeDatasetsDraw",{cancelable:!0}))return;const t=this.getSortedVisibleDatasetMetas();for(let e=t.length-1;e>=0;--e)this._drawDataset(t[e]);this.notifyPlugins("afterDatasetsDraw")}_drawDataset(t){const e=this.ctx,i={meta:t,index:t.index,cancelable:!0},s=Po(this,t);!1!==this.notifyPlugins("beforeDatasetDraw",i)&&(s&&gs(e,s),t.controller.draw(),s&&fs(e),i.cancelable=!1,this.notifyPlugins("afterDatasetDraw",i))}isPointInArea(t){return ps(t,this.chartArea,this._minPadding)}getElementsAtEventForMode(t,e,i,s){const o=vn.modes[e];return"function"==typeof o?o(this,t,i,s):[]}getDatasetMeta(t){const e=this.data.datasets[t],i=this._metasets;let s=i.filter(t=>t&&t._dataset===e).pop();return s||(s={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null,order:e&&e.order||0,index:t,_dataset:e,_parsed:[],_sorted:!1},i.push(s)),s}getContext(){return this.$context||(this.$context=Os(null,{chart:this,type:"chart"}))}getVisibleDatasetCount(){return this.getSortedVisibleDatasetMetas().length}isDatasetVisible(t){const e=this.data.datasets[t];if(!e)return!1;const i=this.getDatasetMeta(t);return"boolean"==typeof i.hidden?!i.hidden:!e.hidden}setDatasetVisibility(t,e){this.getDatasetMeta(t).hidden=!e}toggleDataVisibility(t){this._hiddenIndices[t]=!this._hiddenIndices[t]}getDataVisibility(t){return!this._hiddenIndices[t]}_updateVisibility(t,e,i){const s=i?"show":"hide",o=this.getDatasetMeta(t),n=o.controller._resolveAnimations(void 0,s);si(e)?(o.data[e].hidden=!i,this.update()):(this.setDatasetVisibility(t,i),n.update(o,{visible:i}),this.update(e=>e.datasetIndex===t?s:void 0))}hide(t,e){this._updateVisibility(t,e,!1)}show(t,e){this._updateVisibility(t,e,!0)}_destroyDatasetMeta(t){const e=this._metasets[t];e&&e.controller&&e.controller._destroy(),delete this._metasets[t]}_stop(){let t,e;for(this.stop(),Eo.remove(this),t=0,e=this.data.datasets.length;t<e;++t)this._destroyDatasetMeta(t)}destroy(){this.notifyPlugins("beforeDestroy");const{canvas:t,ctx:e}=this;this._stop(),this.config.clearCache(),t&&(this.unbindEvents(),cs(t,e),this.platform.releaseContext(e),this.canvas=null,this.ctx=null),delete La[this.id],this.notifyPlugins("afterDestroy")}toBase64Image(...t){return this.canvas.toDataURL(...t)}bindEvents(){this.bindUserEvents(),this.options.responsive?this.bindResponsiveEvents():this.attached=!0}bindUserEvents(){const t=this._listeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(t,e,i)=>{t.offsetX=e,t.offsetY=i,this._eventHandler(t)};Ye(this.options.events,t=>i(t,s))}bindResponsiveEvents(){this._responsiveListeners||(this._responsiveListeners={});const t=this._responsiveListeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(i,s)=>{t[i]&&(e.removeEventListener(this,i,s),delete t[i])},o=(t,e)=>{this.canvas&&this.resize(t,e)};let n;const a=()=>{s("attach",a),this.attached=!0,this.resize(),i("resize",o),i("detach",n)};n=()=>{this.attached=!1,s("resize",o),this._stop(),this._resize(0,0),i("attach",a)},e.isAttached(this.canvas)?a():n()}unbindEvents(){Ye(this._listeners,(t,e)=>{this.platform.removeEventListener(this,e,t)}),this._listeners={},Ye(this._responsiveListeners,(t,e)=>{this.platform.removeEventListener(this,e,t)}),this._responsiveListeners=void 0}updateHoverStyle(t,e,i){const s=i?"set":"remove";let o,n,a,r;for("dataset"===e&&(o=this.getDatasetMeta(t[0].datasetIndex),o.controller["_"+s+"DatasetHoverStyle"]()),a=0,r=t.length;a<r;++a){n=t[a];const e=n&&this.getDatasetMeta(n.datasetIndex).controller;e&&e[s+"HoverStyle"](n.element,n.datasetIndex,n.index)}}getActiveElements(){return this._active||[]}setActiveElements(t){const e=this._active||[],i=t.map(({datasetIndex:t,index:e})=>{const i=this.getDatasetMeta(t);if(!i)throw new Error("No dataset found at index "+t);return{datasetIndex:t,element:i.data[e],index:e}});!Xe(i,e)&&(this._active=i,this._lastEvent=null,this._updateHoverStyles(i,e))}notifyPlugins(t,e,i){return this._plugins.notify(this,t,e,i)}isPluginEnabled(t){return 1===this._plugins._cache.filter(e=>e.plugin.id===t).length}_updateHoverStyles(t,e,i){const s=this.options.hover,o=(t,e)=>t.filter(t=>!e.some(e=>t.datasetIndex===e.datasetIndex&&t.index===e.index)),n=o(e,t),a=i?t:o(t,e);n.length&&this.updateHoverStyle(n,s.mode,!1),a.length&&s.mode&&this.updateHoverStyle(a,s.mode,!0)}_eventHandler(t,e){const i={event:t,replay:e,cancelable:!0,inChartArea:this.isPointInArea(t)},s=e=>(e.options.events||this.options.events).includes(t.native.type);if(!1===this.notifyPlugins("beforeEvent",i,s))return;const o=this._handleEvent(t,e,i.inChartArea);return i.cancelable=!1,this.notifyPlugins("afterEvent",i,s),(o||i.changed)&&this.render(),this}_handleEvent(t,e,i){const{_active:s=[],options:o}=this,n=e,a=this._getActiveElements(t,s,i,n),r=function(t){return"mouseup"===t.type||"click"===t.type||"contextmenu"===t.type}(t),l=function(t,e,i,s){return i&&"mouseout"!==t.type?s?e:t:null}(t,this._lastEvent,i,r);i&&(this._lastEvent=null,Ue(o.onHover,[t,a,this],this),r&&Ue(o.onClick,[t,a,this],this));const h=!Xe(a,s);return(h||e)&&(this._active=a,this._updateHoverStyles(a,s,e)),this._lastEvent=l,h}_getActiveElements(t,e,i,s){if("mouseout"===t.type)return[];if(!i)return e;const o=this.options.hover;return this.getElementsAtEventForMode(t,o.mode,o,s)}}function Fa(){return Ye(Ia.instances,t=>t._plugins.invalidate())}function Va(t,e,i,s){const o=Ss(t.options.borderRadius,["outerStart","outerEnd","innerStart","innerEnd"]);const n=(i-e)/2,a=Math.min(n,s*e/2),r=t=>{const e=(i-Math.min(n,t))*s/2;return Ai(t,0,Math.min(n,e))};return{outerStart:r(o.outerStart),outerEnd:r(o.outerEnd),innerStart:Ai(o.innerStart,0,a),innerEnd:Ai(o.innerEnd,0,a)}}function Ha(t,e,i,s){return{x:i+t*Math.cos(e),y:s+t*Math.sin(e)}}function Na(t,e,i,s,o,n){const{x:a,y:r,startAngle:l,pixelMargin:h,innerRadius:c}=e,d=Math.max(e.outerRadius+s+i-h,0),u=c>0?c+s+i+h:0;let p=0;const g=o-l;if(s){const t=((c>0?c-s:0)+(d>0?d-s:0))/2;p=(g-(0!==t?g*t/(t+s):g))/2}const f=(g-Math.max(.001,g*d-i/ai)/d)/2,m=l+f+p,b=o-f-p,{outerStart:x,outerEnd:v,innerStart:_,innerEnd:y}=Va(e,u,d,b-m),w=d-x,k=d-v,C=m+x/w,M=b-v/k,S=u+_,P=u+y,A=m+_/S,E=b-y/P;if(t.beginPath(),n){const e=(C+M)/2;if(t.arc(a,r,d,C,e),t.arc(a,r,d,e,M),v>0){const e=Ha(k,M,a,r);t.arc(e.x,e.y,v,M,b+di)}const i=Ha(P,b,a,r);if(t.lineTo(i.x,i.y),y>0){const e=Ha(P,E,a,r);t.arc(e.x,e.y,y,b+di,E+Math.PI)}const s=(b-y/u+(m+_/u))/2;if(t.arc(a,r,u,b-y/u,s,!0),t.arc(a,r,u,s,m+_/u,!0),_>0){const e=Ha(S,A,a,r);t.arc(e.x,e.y,_,A+Math.PI,m-di)}const o=Ha(w,m,a,r);if(t.lineTo(o.x,o.y),x>0){const e=Ha(w,C,a,r);t.arc(e.x,e.y,x,m-di,C)}}else{t.moveTo(a,r);const e=Math.cos(C)*d+a,i=Math.sin(C)*d+r;t.lineTo(e,i);const s=Math.cos(M)*d+a,o=Math.sin(M)*d+r;t.lineTo(s,o)}t.closePath()}function Ba(t,e,i,s,o){const{fullCircles:n,startAngle:a,circumference:r,options:l}=e,{borderWidth:h,borderJoinStyle:c,borderDash:d,borderDashOffset:u,borderRadius:p}=l,g="inner"===l.borderAlign;if(!h)return;t.setLineDash(d||[]),t.lineDashOffset=u,g?(t.lineWidth=2*h,t.lineJoin=c||"round"):(t.lineWidth=h,t.lineJoin=c||"bevel");let f=e.endAngle;if(n){Na(t,e,i,s,f,o);for(let e=0;e<n;++e)t.stroke();isNaN(r)||(f=a+(r%ri||ri))}g&&function(t,e,i){const{startAngle:s,pixelMargin:o,x:n,y:a,outerRadius:r,innerRadius:l}=e;let h=o/r;t.beginPath(),t.arc(n,a,r,s-h,i+h),l>o?(h=o/l,t.arc(n,a,l,i+h,s-h,!0)):t.arc(n,a,o,i+di,s-di),t.closePath(),t.clip()}(t,e,f),l.selfJoin&&f-a>=ai&&0===p&&"miter"!==c&&function(t,e,i){const{startAngle:s,x:o,y:n,outerRadius:a,innerRadius:r,options:l}=e,{borderWidth:h,borderJoinStyle:c}=l,d=Math.min(h/a,Si(s-i));if(t.beginPath(),t.arc(o,n,a-h/2,s+d/2,i-d/2),r>0){const e=Math.min(h/r,Si(s-i));t.arc(o,n,r+h/2,i-e/2,s+e/2,!0)}else{const e=Math.min(h/2,a*Si(s-i));if("round"===c)t.arc(o,n,e,i-ai/2,s+ai/2,!0);else if("bevel"===c){const a=2*e*e,r=-a*Math.cos(i+ai/2)+o,l=-a*Math.sin(i+ai/2)+n,h=a*Math.cos(s+ai/2)+o,c=a*Math.sin(s+ai/2)+n;t.lineTo(r,l),t.lineTo(h,c)}}t.closePath(),t.moveTo(0,0),t.rect(0,0,t.canvas.width,t.canvas.height),t.clip("evenodd")}(t,e,f),n||(Na(t,e,i,s,f,o),t.stroke())}s(Ia,"defaults",as),s(Ia,"instances",La),s(Ia,"overrides",es),s(Ia,"registry",ha),s(Ia,"version","4.5.1"),s(Ia,"getChart",Ra);class Wa extends Kn{constructor(t){super(),s(this,"circumference"),s(this,"endAngle"),s(this,"fullCircles"),s(this,"innerRadius"),s(this,"outerRadius"),s(this,"pixelMargin"),s(this,"startAngle"),this.options=void 0,this.circumference=void 0,this.startAngle=void 0,this.endAngle=void 0,this.innerRadius=void 0,this.outerRadius=void 0,this.pixelMargin=0,this.fullCircles=0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.getProps(["x","y"],i),{angle:o,distance:n}=ki(s,{x:t,y:e}),{startAngle:a,endAngle:r,innerRadius:l,outerRadius:h,circumference:c}=this.getProps(["startAngle","endAngle","innerRadius","outerRadius","circumference"],i),d=(this.options.spacing+this.options.borderWidth)/2,u=We(c,r-a),p=Pi(o,a,r)&&a!==r,g=u>=ri||p,f=Ei(n,l+d,h+d);return g&&f}getCenterPoint(t){const{x:e,y:i,startAngle:s,endAngle:o,innerRadius:n,outerRadius:a}=this.getProps(["x","y","startAngle","endAngle","innerRadius","outerRadius"],t),{offset:r,spacing:l}=this.options,h=(s+o)/2,c=(n+a+l+r)/2;return{x:e+Math.cos(h)*c,y:i+Math.sin(h)*c}}tooltipPosition(t){return this.getCenterPoint(t)}draw(t){const{options:e,circumference:i}=this,s=(e.offset||0)/4,o=(e.spacing||0)/2,n=e.circular;if(this.pixelMargin="inner"===e.borderAlign?.33:0,this.fullCircles=i>ri?Math.floor(i/ri):0,0===i||this.innerRadius<0||this.outerRadius<0)return;t.save();const a=(this.startAngle+this.endAngle)/2;t.translate(Math.cos(a)*s,Math.sin(a)*s);const r=s*(1-Math.sin(Math.min(ai,i||0)));t.fillStyle=e.backgroundColor,t.strokeStyle=e.borderColor,function(t,e,i,s,o){const{fullCircles:n,startAngle:a,circumference:r}=e;let l=e.endAngle;if(n){Na(t,e,i,s,l,o);for(let e=0;e<n;++e)t.fill();isNaN(r)||(l=a+(r%ri||ri))}Na(t,e,i,s,l,o),t.fill()}(t,this,r,o,n),Ba(t,this,r,o,n),t.restore()}}function ja(t,e,i=e){t.lineCap=We(i.borderCapStyle,e.borderCapStyle),t.setLineDash(We(i.borderDash,e.borderDash)),t.lineDashOffset=We(i.borderDashOffset,e.borderDashOffset),t.lineJoin=We(i.borderJoinStyle,e.borderJoinStyle),t.lineWidth=We(i.borderWidth,e.borderWidth),t.strokeStyle=We(i.borderColor,e.borderColor)}function Ua(t,e,i){t.lineTo(i.x,i.y)}function Ya(t,e,i={}){const s=t.length,{start:o=0,end:n=s-1}=i,{start:a,end:r}=e,l=Math.max(o,a),h=Math.min(n,r),c=o<a&&n<a||o>r&&n>r;return{count:s,start:l,loop:e.loop,ilen:h<l&&!c?s+h-l:h-l}}function Xa(t,e,i,s){const{points:o,options:n}=e,{count:a,start:r,loop:l,ilen:h}=Ya(o,i,s),c=function(t){return t.stepped?ms:t.tension||"monotone"===t.cubicInterpolationMode?bs:Ua}(n);let d,u,p,{move:g=!0,reverse:f}=s||{};for(d=0;d<=h;++d)u=o[(r+(f?h-d:d))%a],u.skip||(g?(t.moveTo(u.x,u.y),g=!1):c(t,p,u,f,n.stepped),p=u);return l&&(u=o[(r+(f?h:0))%a],c(t,p,u,f,n.stepped)),!!l}function qa(t,e,i,s){const o=e.points,{count:n,start:a,ilen:r}=Ya(o,i,s),{move:l=!0,reverse:h}=s||{};let c,d,u,p,g,f,m=0,b=0;const x=t=>(a+(h?r-t:t))%n,v=()=>{p!==g&&(t.lineTo(m,g),t.lineTo(m,p),t.lineTo(m,f))};for(l&&(d=o[x(0)],t.moveTo(d.x,d.y)),c=0;c<=r;++c){if(d=o[x(c)],d.skip)continue;const e=d.x,i=d.y,s=0|e;s===u?(i<p?p=i:i>g&&(g=i),m=(b*m+e)/++b):(v(),t.lineTo(e,i),u=s,b=0,p=g=i),f=i}v()}function Ga(t){const e=t.options,i=e.borderDash&&e.borderDash.length;return!(t._decimated||t._loop||e.tension||"monotone"===e.cubicInterpolationMode||e.stepped||i)?qa:Xa}s(Wa,"id","arc"),s(Wa,"defaults",{borderAlign:"center",borderColor:"#fff",borderDash:[],borderDashOffset:0,borderJoinStyle:void 0,borderRadius:0,borderWidth:2,offset:0,spacing:0,angle:void 0,circular:!0,selfJoin:!1}),s(Wa,"defaultRoutes",{backgroundColor:"backgroundColor"}),s(Wa,"descriptors",{_scriptable:!0,_indexable:t=>"borderDash"!==t});const Ka="function"==typeof Path2D;function Ja(t,e,i,s){Ka&&!e.options.segment?function(t,e,i,s){let o=e._path;o||(o=e._path=new Path2D,e.path(o,i,s)&&o.closePath()),ja(t,e.options),t.stroke(o)}(t,e,i,s):function(t,e,i,s){const{segments:o,options:n}=e,a=Ga(e);for(const r of o)ja(t,n,r.style),t.beginPath(),a(t,e,r,{start:i,end:i+s-1})&&t.closePath(),t.stroke()}(t,e,i,s)}class Za extends Kn{constructor(t){super(),this.animated=!0,this.options=void 0,this._chart=void 0,this._loop=void 0,this._fullLoop=void 0,this._path=void 0,this._points=void 0,this._segments=void 0,this._decimated=!1,this._pointsUpdated=!1,this._datasetIndex=void 0,t&&Object.assign(this,t)}updateControlPoints(t,e){const i=this.options;if((i.tension||"monotone"===i.cubicInterpolationMode)&&!i.stepped&&!this._pointsUpdated){const s=i.spanGaps?this._loop:this._fullLoop;Qs(this._points,i,t,s,e),this._pointsUpdated=!0}}set points(t){this._points=t,delete this._segments,delete this._path,this._pointsUpdated=!1}get points(){return this._points}get segments(){return this._segments||(this._segments=function(t,e){const i=t.points,s=t.options.spanGaps,o=i.length;if(!o)return[];const n=!!t._loop,{start:a,end:r}=function(t,e,i,s){let o=0,n=e-1;if(i&&!s)for(;o<e&&!t[o].skip;)o++;for(;o<e&&t[o].skip;)o++;for(o%=e,i&&(n+=o);n>o&&t[n%e].skip;)n--;return n%=e,{start:o,end:n}}(i,o,n,s);return ko(t,!0===s?[{start:a,end:r,loop:n}]:function(t,e,i,s){const o=t.length,n=[];let a,r=e,l=t[e];for(a=e+1;a<=i;++a){const i=t[a%o];i.skip||i.stop?l.skip||(s=!1,n.push({start:e%o,end:(a-1)%o,loop:s}),e=r=i.stop?a:null):(r=a,l.skip&&(e=a)),l=i}return null!==r&&n.push({start:e%o,end:r%o,loop:s}),n}(i,a,r<a?r+o:r,!!t._fullLoop&&0===a&&r===o-1),i,e)}(this,this.options.segment))}first(){const t=this.segments,e=this.points;return t.length&&e[t[0].start]}last(){const t=this.segments,e=this.points,i=t.length;return i&&e[t[i-1].end]}interpolate(t,e){const i=this.options,s=t[e],o=this.points,n=wo(this,{property:e,start:s,end:s});if(!n.length)return;const a=[],r=function(t){return t.stepped?go:t.tension||"monotone"===t.cubicInterpolationMode?fo:po}(i);let l,h;for(l=0,h=n.length;l<h;++l){const{start:h,end:c}=n[l],d=o[h],u=o[c];if(d===u){a.push(d);continue}const p=r(d,u,Math.abs((s-d[e])/(u[e]-d[e])),i.stepped);p[e]=t[e],a.push(p)}return 1===a.length?a[0]:a}pathSegment(t,e,i){return Ga(this)(t,this,e,i)}path(t,e,i){const s=this.segments,o=Ga(this);let n=this._loop;e=e||0,i=i||this.points.length-e;for(const a of s)n&=o(t,this,a,{start:e,end:e+i-1});return!!n}draw(t,e,i,s){const o=this.options||{};(this.points||[]).length&&o.borderWidth&&(t.save(),Ja(t,this,i,s),t.restore()),this.animated&&(this._pointsUpdated=!1,this._path=void 0)}}function Qa(t,e,i,s){const o=t.options,{[i]:n}=t.getProps([i],s);return Math.abs(e-n)<o.radius+o.hitRadius}s(Za,"id","line"),s(Za,"defaults",{borderCapStyle:"butt",borderDash:[],borderDashOffset:0,borderJoinStyle:"miter",borderWidth:3,capBezierPoints:!0,cubicInterpolationMode:"default",fill:!1,spanGaps:!1,stepped:!1,tension:0}),s(Za,"defaultRoutes",{backgroundColor:"backgroundColor",borderColor:"borderColor"}),s(Za,"descriptors",{_scriptable:!0,_indexable:t=>"borderDash"!==t&&"fill"!==t});class tr extends Kn{constructor(t){super(),s(this,"parsed"),s(this,"skip"),s(this,"stop"),this.options=void 0,this.parsed=void 0,this.skip=void 0,this.stop=void 0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.options,{x:o,y:n}=this.getProps(["x","y"],i);return Math.pow(t-o,2)+Math.pow(e-n,2)<Math.pow(s.hitRadius+s.radius,2)}inXRange(t,e){return Qa(this,t,"x",e)}inYRange(t,e){return Qa(this,t,"y",e)}getCenterPoint(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}size(t){let e=(t=t||this.options||{}).radius||0;e=Math.max(e,e&&t.hoverRadius||0);return 2*(e+(e&&t.borderWidth||0))}draw(t,e){const i=this.options;this.skip||i.radius<.1||!ps(this,e,this.size(i)/2)||(t.strokeStyle=i.borderColor,t.lineWidth=i.borderWidth,t.fillStyle=i.backgroundColor,ds(t,i,this.x,this.y))}getRange(){const t=this.options||{};return t.radius+t.hitRadius}}function er(t,e){const{x:i,y:s,base:o,width:n,height:a}=t.getProps(["x","y","base","width","height"],e);let r,l,h,c,d;return t.horizontal?(d=a/2,r=Math.min(i,o),l=Math.max(i,o),h=s-d,c=s+d):(d=n/2,r=i-d,l=i+d,h=Math.min(s,o),c=Math.max(s,o)),{left:r,top:h,right:l,bottom:c}}function ir(t,e,i,s){return t?0:Ai(e,i,s)}function sr(t){const e=er(t),i=e.right-e.left,s=e.bottom-e.top,o=function(t,e,i){const s=t.options.borderWidth,o=t.borderSkipped,n=Ps(s);return{t:ir(o.top,n.top,0,i),r:ir(o.right,n.right,0,e),b:ir(o.bottom,n.bottom,0,i),l:ir(o.left,n.left,0,e)}}(t,i/2,s/2),n=function(t,e,i){const{enableBorderRadius:s}=t.getProps(["enableBorderRadius"]),o=t.options.borderRadius,n=As(o),a=Math.min(e,i),r=t.borderSkipped,l=s||He(o);return{topLeft:ir(!l||r.top||r.left,n.topLeft,0,a),topRight:ir(!l||r.top||r.right,n.topRight,0,a),bottomLeft:ir(!l||r.bottom||r.left,n.bottomLeft,0,a),bottomRight:ir(!l||r.bottom||r.right,n.bottomRight,0,a)}}(t,i/2,s/2);return{outer:{x:e.left,y:e.top,w:i,h:s,radius:n},inner:{x:e.left+o.l,y:e.top+o.t,w:i-o.l-o.r,h:s-o.t-o.b,radius:{topLeft:Math.max(0,n.topLeft-Math.max(o.t,o.l)),topRight:Math.max(0,n.topRight-Math.max(o.t,o.r)),bottomLeft:Math.max(0,n.bottomLeft-Math.max(o.b,o.l)),bottomRight:Math.max(0,n.bottomRight-Math.max(o.b,o.r))}}}}function or(t,e,i,s){const o=null===e,n=null===i,a=t&&!(o&&n)&&er(t,s);return a&&(o||Ei(e,a.left,a.right))&&(n||Ei(i,a.top,a.bottom))}function nr(t,e){t.rect(e.x,e.y,e.w,e.h)}function ar(t,e,i={}){const s=t.x!==i.x?-e:0,o=t.y!==i.y?-e:0,n=(t.x+t.w!==i.x+i.w?e:0)-s,a=(t.y+t.h!==i.y+i.h?e:0)-o;return{x:t.x+s,y:t.y+o,w:t.w+n,h:t.h+a,radius:t.radius}}s(tr,"id","point"),s(tr,"defaults",{borderWidth:1,hitRadius:1,hoverBorderWidth:1,hoverRadius:4,pointStyle:"circle",radius:3,rotation:0}),s(tr,"defaultRoutes",{backgroundColor:"backgroundColor",borderColor:"borderColor"});class rr extends Kn{constructor(t){super(),this.options=void 0,this.horizontal=void 0,this.base=void 0,this.width=void 0,this.height=void 0,this.inflateAmount=void 0,t&&Object.assign(this,t)}draw(t){const{inflateAmount:e,options:{borderColor:i,backgroundColor:s}}=this,{inner:o,outer:n}=sr(this),a=(r=n.radius).topLeft||r.topRight||r.bottomLeft||r.bottomRight?ys:nr;var r;t.save(),n.w===o.w&&n.h===o.h||(t.beginPath(),a(t,ar(n,e,o)),t.clip(),a(t,ar(o,-e,n)),t.fillStyle=i,t.fill("evenodd")),t.beginPath(),a(t,ar(o,e)),t.fillStyle=s,t.fill(),t.restore()}inRange(t,e,i){return or(this,t,e,i)}inXRange(t,e){return or(this,t,null,e)}inYRange(t,e){return or(this,null,t,e)}getCenterPoint(t){const{x:e,y:i,base:s,horizontal:o}=this.getProps(["x","y","base","horizontal"],t);return{x:o?(e+s)/2:e,y:o?i:(i+s)/2}}getRange(t){return"x"===t?this.width/2:this.height/2}}s(rr,"id","bar"),s(rr,"defaults",{borderSkipped:"start",borderWidth:0,borderRadius:0,inflateAmount:"auto",pointStyle:void 0}),s(rr,"defaultRoutes",{backgroundColor:"backgroundColor",borderColor:"borderColor"});var lr=Object.freeze({__proto__:null,ArcElement:Wa,BarElement:rr,LineElement:Za,PointElement:tr});const hr=["rgb(54, 162, 235)","rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(75, 192, 192)","rgb(153, 102, 255)","rgb(201, 203, 207)"],cr=hr.map(t=>t.replace("rgb(","rgba(").replace(")",", 0.5)"));function dr(t){return hr[t%hr.length]}function ur(t){return cr[t%cr.length]}function pr(t){let e=0;return(i,s)=>{const o=t.getDatasetMeta(s).controller;o instanceof sn?e=function(t,e){return t.backgroundColor=t.data.map(()=>dr(e++)),e}(i,e):o instanceof nn?e=function(t,e){return t.backgroundColor=t.data.map(()=>ur(e++)),e}(i,e):o&&(e=function(t,e){return t.borderColor=dr(e),t.backgroundColor=ur(e),++e}(i,e))}}function gr(t){let e;for(e in t)if(t[e].borderColor||t[e].backgroundColor)return!0;return!1}var fr={id:"colors",defaults:{enabled:!0,forceOverride:!1},beforeLayout(t,e,i){if(!i.enabled)return;const{data:{datasets:s},options:o}=t.config,{elements:n}=o,a=gr(s)||(r=o)&&(r.borderColor||r.backgroundColor)||n&&gr(n)||"rgba(0,0,0,0.1)"!==as.borderColor||"rgba(0,0,0,0.1)"!==as.backgroundColor;var r;if(!i.forceOverride&&a)return;const l=pr(t);s.forEach(l)}};function mr(t){if(t._decimated){const e=t._data;delete t._decimated,delete t._data,Object.defineProperty(t,"data",{configurable:!0,enumerable:!0,writable:!0,value:e})}}function br(t){t.data.datasets.forEach(t=>{mr(t)})}var xr={id:"decimation",defaults:{algorithm:"min-max",enabled:!1},beforeElementsUpdate:(t,e,i)=>{if(!i.enabled)return void br(t);const s=t.width;t.data.datasets.forEach((e,o)=>{const{_data:n,indexAxis:a}=e,r=t.getDatasetMeta(o),l=n||e.data;if("y"===Ds([a,t.options.indexAxis]))return;if(!r.controller.supportsDecimation)return;const h=t.scales[r.xAxisID];if("linear"!==h.type&&"time"!==h.type)return;if(t.options.parsing)return;let{start:c,count:d}=function(t,e){const i=e.length;let s,o=0;const{iScale:n}=t,{min:a,max:r,minDefined:l,maxDefined:h}=n.getUserBounds();return l&&(o=Ai(Di(e,n.axis,a).lo,0,i-1)),s=h?Ai(Di(e,n.axis,r).hi+1,o,i)-o:i-o,{start:o,count:s}}(r,l);if(d<=(i.threshold||4*s))return void mr(e);let u;switch(Fe(n)&&(e._data=l,delete e.data,Object.defineProperty(e,"data",{configurable:!0,enumerable:!0,get:function(){return this._decimated},set:function(t){this._data=t}})),i.algorithm){case"lttb":u=function(t,e,i,s,o){const n=o.samples||s;if(n>=i)return t.slice(e,e+i);const a=[],r=(i-2)/(n-2);let l=0;const h=e+i-1;let c,d,u,p,g,f=e;for(a[l++]=t[f],c=0;c<n-2;c++){let s,o=0,n=0;const h=Math.floor((c+1)*r)+1+e,m=Math.min(Math.floor((c+2)*r)+1,i)+e,b=m-h;for(s=h;s<m;s++)o+=t[s].x,n+=t[s].y;o/=b,n/=b;const x=Math.floor(c*r)+1+e,v=Math.min(Math.floor((c+1)*r)+1,i)+e,{x:_,y:y}=t[f];for(u=p=-1,s=x;s<v;s++)p=.5*Math.abs((_-o)*(t[s].y-y)-(_-t[s].x)*(n-y)),p>u&&(u=p,d=t[s],g=s);a[l++]=d,f=g}return a[l++]=t[h],a}(l,c,d,s,i);break;case"min-max":u=function(t,e,i,s){let o,n,a,r,l,h,c,d,u,p,g=0,f=0;const m=[],b=e+i-1,x=t[e].x,v=t[b].x-x;for(o=e;o<e+i;++o){n=t[o],a=(n.x-x)/v*s,r=n.y;const e=0|a;if(e===l)r<u?(u=r,h=o):r>p&&(p=r,c=o),g=(f*g+n.x)/++f;else{const i=o-1;if(!Fe(h)&&!Fe(c)){const e=Math.min(h,c),s=Math.max(h,c);e!==d&&e!==i&&m.push({...t[e],x:g}),s!==d&&s!==i&&m.push({...t[s],x:g})}o>0&&i!==d&&m.push(t[i]),m.push(n),l=e,f=0,u=p=r,h=c=d=o}}return m}(l,c,d,s);break;default:throw new Error(`Unsupported decimation algorithm '${i.algorithm}'`)}e._decimated=u})},destroy(t){br(t)}};function vr(t,e,i,s){if(s)return;let o=e[t],n=i[t];return"angle"===t&&(o=Si(o),n=Si(n)),{property:t,start:o,end:n}}function _r(t,e,i){for(;e>t;e--){const t=i[e];if(!isNaN(t.x)&&!isNaN(t.y))break}return e}function yr(t,e,i,s){return t&&e?s(t[i],e[i]):t?t[i]:e?e[i]:0}function wr(t,e){let i=[],s=!1;return Ve(t)?(s=!0,i=t):i=function(t,e){const{x:i=null,y:s=null}=t||{},o=e.points,n=[];return e.segments.forEach(({start:t,end:e})=>{e=_r(t,e,o);const a=o[t],r=o[e];null!==s?(n.push({x:a.x,y:s}),n.push({x:r.x,y:s})):null!==i&&(n.push({x:i,y:a.y}),n.push({x:i,y:r.y}))}),n}(t,e),i.length?new Za({points:i,options:{tension:0},_loop:s,_fullLoop:s}):null}function kr(t){return t&&!1!==t.fill}function Cr(t,e,i){let s=t[e].fill;const o=[e];let n;if(!i)return s;for(;!1!==s&&-1===o.indexOf(s);){if(!Ne(s))return s;if(n=t[s],!n)return!1;if(n.visible)return s;o.push(s),s=n.fill}return!1}function Mr(t,e,i){const s=function(t){const e=t.options,i=e.fill;let s=We(i&&i.target,i);void 0===s&&(s=!!e.backgroundColor);if(!1===s||null===s)return!1;if(!0===s)return"origin";return s}(t);if(He(s))return!isNaN(s.value)&&s;let o=parseFloat(s);return Ne(o)&&Math.floor(o)===o?function(t,e,i,s){"-"!==t&&"+"!==t||(i=e+i);if(i===e||i<0||i>=s)return!1;return i}(s[0],e,o,i):["origin","start","end","stack","shape"].indexOf(s)>=0&&s}function Sr(t,e,i){const s=[];for(let o=0;o<i.length;o++){const n=i[o],{first:a,last:r,point:l}=Pr(n,e,"x");if(!(!l||a&&r))if(a)s.unshift(l);else if(t.push(l),!r)break}t.push(...s)}function Pr(t,e,i){const s=t.interpolate(e,i);if(!s)return{};const o=s[i],n=t.segments,a=t.points;let r=!1,l=!1;for(let h=0;h<n.length;h++){const t=n[h],e=a[t.start][i],s=a[t.end][i];if(Ei(o,e,s)){r=o===e,l=o===s;break}}return{first:r,last:l,point:s}}class Ar{constructor(t){this.x=t.x,this.y=t.y,this.radius=t.radius}pathSegment(t,e,i){const{x:s,y:o,radius:n}=this;return e=e||{start:0,end:ri},t.arc(s,o,n,e.end,e.start,!0),!i.bounds}interpolate(t){const{x:e,y:i,radius:s}=this,o=t.angle;return{x:e+Math.cos(o)*s,y:i+Math.sin(o)*s,angle:o}}}function Er(t){const{chart:e,fill:i,line:s}=t;if(Ne(i))return function(t,e){const i=t.getDatasetMeta(e),s=i&&t.isDatasetVisible(e);return s?i.dataset:null}(e,i);if("stack"===i)return function(t){const{scale:e,index:i,line:s}=t,o=[],n=s.segments,a=s.points,r=function(t,e){const i=[],s=t.getMatchingVisibleMetas("line");for(let o=0;o<s.length;o++){const t=s[o];if(t.index===e)break;t.hidden||i.unshift(t.dataset)}return i}(e,i);r.push(wr({x:null,y:e.bottom},s));for(let l=0;l<n.length;l++){const t=n[l];for(let e=t.start;e<=t.end;e++)Sr(o,a[e],r)}return new Za({points:o,options:{}})}(t);if("shape"===i)return!0;const o=function(t){const e=t.scale||{};if(e.getPointPositionForValue)return function(t){const{scale:e,fill:i}=t,s=e.options,o=e.getLabels().length,n=s.reverse?e.max:e.min,a=function(t,e,i){let s;return s="start"===t?i:"end"===t?e.options.reverse?e.min:e.max:He(t)?t.value:e.getBaseValue(),s}(i,e,n),r=[];if(s.grid.circular){const t=e.getPointPositionForValue(0,n);return new Ar({x:t.x,y:t.y,radius:e.getDistanceFromCenterForValue(a)})}for(let l=0;l<o;++l)r.push(e.getPointPositionForValue(l,a));return r}(t);return function(t){const{scale:e={},fill:i}=t,s=function(t,e){let i=null;return"start"===t?i=e.bottom:"end"===t?i=e.top:He(t)?i=e.getPixelForValue(t.value):e.getBasePixel&&(i=e.getBasePixel()),i}(i,e);if(Ne(s)){const t=e.isHorizontal();return{x:t?s:null,y:t?null:s}}return null}(t)}(t);return o instanceof Ar?o:wr(o,s)}function $r(t,e,i){const s=Er(e),{chart:o,index:n,line:a,scale:r,axis:l}=e,h=a.options,c=h.fill,d=h.backgroundColor,{above:u=d,below:p=d}=c||{},g=o.getDatasetMeta(n),f=Po(o,g);s&&a.points.length&&(gs(t,i),function(t,e){const{line:i,target:s,above:o,below:n,area:a,scale:r,clip:l}=e,h=i._loop?"angle":e.axis;t.save();let c=n;n!==o&&("x"===h?(Dr(t,s,a.top),Tr(t,{line:i,target:s,color:o,scale:r,property:h,clip:l}),t.restore(),t.save(),Dr(t,s,a.bottom)):"y"===h&&(Or(t,s,a.left),Tr(t,{line:i,target:s,color:n,scale:r,property:h,clip:l}),t.restore(),t.save(),Or(t,s,a.right),c=o));Tr(t,{line:i,target:s,color:c,scale:r,property:h,clip:l}),t.restore()}(t,{line:a,target:s,above:u,below:p,area:i,scale:r,axis:l,clip:f}),fs(t))}function Dr(t,e,i){const{segments:s,points:o}=e;let n=!0,a=!1;t.beginPath();for(const r of s){const{start:s,end:l}=r,h=o[s],c=o[_r(s,l,o)];n?(t.moveTo(h.x,h.y),n=!1):(t.lineTo(h.x,i),t.lineTo(h.x,h.y)),a=!!e.pathSegment(t,r,{move:a}),a?t.closePath():t.lineTo(c.x,i)}t.lineTo(e.first().x,i),t.closePath(),t.clip()}function Or(t,e,i){const{segments:s,points:o}=e;let n=!0,a=!1;t.beginPath();for(const r of s){const{start:s,end:l}=r,h=o[s],c=o[_r(s,l,o)];n?(t.moveTo(h.x,h.y),n=!1):(t.lineTo(i,h.y),t.lineTo(h.x,h.y)),a=!!e.pathSegment(t,r,{move:a}),a?t.closePath():t.lineTo(i,c.y)}t.lineTo(i,e.first().y),t.closePath(),t.clip()}function Tr(t,e){const{line:i,target:s,property:o,color:n,scale:a,clip:r}=e,l=function(t,e,i){const s=t.segments,o=t.points,n=e.points,a=[];for(const r of s){let{start:t,end:s}=r;s=_r(t,s,o);const l=vr(i,o[t],o[s],r.loop);if(!e.segments){a.push({source:r,target:l,start:o[t],end:o[s]});continue}const h=wo(e,l);for(const e of h){const t=vr(i,n[e.start],n[e.end],e.loop),s=yo(r,o,t);for(const o of s)a.push({source:o,target:e,start:{[i]:yr(l,t,"start",Math.max)},end:{[i]:yr(l,t,"end",Math.min)}})}}return a}(i,s,o);for(const{source:h,target:c,start:d,end:u}of l){const{style:{backgroundColor:e=n}={}}=h,l=!0!==s;t.save(),t.fillStyle=e,Lr(t,a,r,l&&vr(o,d,u)),t.beginPath();const p=!!i.pathSegment(t,h);let g;if(l){p?t.closePath():Rr(t,s,u,o);const e=!!s.pathSegment(t,c,{move:p,reverse:!0});g=p&&e,g||Rr(t,s,d,o)}t.closePath(),t.fill(g?"evenodd":"nonzero"),t.restore()}}function Lr(t,e,i,s){const o=e.chart.chartArea,{property:n,start:a,end:r}=s||{};if("x"===n||"y"===n){let e,s,l,h;"x"===n?(e=a,s=o.top,l=r,h=o.bottom):(e=o.left,s=a,l=o.right,h=r),t.beginPath(),i&&(e=Math.max(e,i.left),l=Math.min(l,i.right),s=Math.max(s,i.top),h=Math.min(h,i.bottom)),t.rect(e,s,l-e,h-s),t.clip()}}function Rr(t,e,i,s){const o=e.interpolate(i,s);o&&t.lineTo(o.x,o.y)}var zr={id:"filler",afterDatasetsUpdate(t,e,i){const s=(t.data.datasets||[]).length,o=[];let n,a,r,l;for(a=0;a<s;++a)n=t.getDatasetMeta(a),r=n.dataset,l=null,r&&r.options&&r instanceof Za&&(l={visible:t.isDatasetVisible(a),index:a,fill:Mr(r,a,s),chart:t,axis:n.controller.options.indexAxis,scale:n.vScale,line:r}),n.$filler=l,o.push(l);for(a=0;a<s;++a)l=o[a],l&&!1!==l.fill&&(l.fill=Cr(o,a,i.propagate))},beforeDraw(t,e,i){const s="beforeDraw"===i.drawTime,o=t.getSortedVisibleDatasetMetas(),n=t.chartArea;for(let a=o.length-1;a>=0;--a){const e=o[a].$filler;e&&(e.line.updateControlPoints(n,e.axis),s&&e.fill&&$r(t.ctx,e,n))}},beforeDatasetsDraw(t,e,i){if("beforeDatasetsDraw"!==i.drawTime)return;const s=t.getSortedVisibleDatasetMetas();for(let o=s.length-1;o>=0;--o){const e=s[o].$filler;kr(e)&&$r(t.ctx,e,t.chartArea)}},beforeDatasetDraw(t,e,i){const s=e.meta.$filler;kr(s)&&"beforeDatasetDraw"===i.drawTime&&$r(t.ctx,s,t.chartArea)},defaults:{propagate:!0,drawTime:"beforeDatasetDraw"}};const Ir=(t,e)=>{let{boxHeight:i=e,boxWidth:s=e}=t;return t.usePointStyle&&(i=Math.min(i,e),s=t.pointStyleWidth||Math.min(s,e)),{boxWidth:s,boxHeight:i,itemHeight:Math.max(e,i)}};class Fr extends Kn{constructor(t){super(),this._added=!1,this.legendHitBoxes=[],this._hoveredItem=null,this.doughnutMode=!1,this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this.legendItems=void 0,this.columnSizes=void 0,this.lineWidths=void 0,this.maxHeight=void 0,this.maxWidth=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.height=void 0,this.width=void 0,this._margins=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e,i){this.maxWidth=t,this.maxHeight=e,this._margins=i,this.setDimensions(),this.buildLabels(),this.fit()}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=this._margins.left,this.right=this.width):(this.height=this.maxHeight,this.top=this._margins.top,this.bottom=this.height)}buildLabels(){const t=this.options.labels||{};let e=Ue(t.generateLabels,[this.chart],this)||[];t.filter&&(e=e.filter(e=>t.filter(e,this.chart.data))),t.sort&&(e=e.sort((e,i)=>t.sort(e,i,this.chart.data))),this.options.reverse&&e.reverse(),this.legendItems=e}fit(){const{options:t,ctx:e}=this;if(!t.display)return void(this.width=this.height=0);const i=t.labels,s=$s(i.font),o=s.size,n=this._computeTitleHeight(),{boxWidth:a,itemHeight:r}=Ir(i,o);let l,h;e.font=s.string,this.isHorizontal()?(l=this.maxWidth,h=this._fitRows(n,o,a,r)+10):(h=this.maxHeight,l=this._fitCols(n,s,a,r)+10),this.width=Math.min(l,t.maxWidth||this.maxWidth),this.height=Math.min(h,t.maxHeight||this.maxHeight)}_fitRows(t,e,i,s){const{ctx:o,maxWidth:n,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.lineWidths=[0],h=s+a;let c=t;o.textAlign="left",o.textBaseline="middle";let d=-1,u=-h;return this.legendItems.forEach((t,p)=>{const g=i+e/2+o.measureText(t.text).width;(0===p||l[l.length-1]+g+2*a>n)&&(c+=h,l[l.length-(p>0?0:1)]=0,u+=h,d++),r[p]={left:0,top:u,row:d,width:g,height:s},l[l.length-1]+=g+a}),c}_fitCols(t,e,i,s){const{ctx:o,maxHeight:n,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.columnSizes=[],h=n-t;let c=a,d=0,u=0,p=0,g=0;return this.legendItems.forEach((t,n)=>{const{itemWidth:f,itemHeight:m}=function(t,e,i,s,o){const n=function(t,e,i,s){let o=t.text;o&&"string"!=typeof o&&(o=o.reduce((t,e)=>t.length>e.length?t:e));return e+i.size/2+s.measureText(o).width}(s,t,e,i),a=function(t,e,i){let s=t;"string"!=typeof e.text&&(s=Vr(e,i));return s}(o,s,e.lineHeight);return{itemWidth:n,itemHeight:a}}(i,e,o,t,s);n>0&&u+m+2*a>h&&(c+=d+a,l.push({width:d,height:u}),p+=d+a,g++,d=u=0),r[n]={left:p,top:u,col:g,width:f,height:m},d=Math.max(d,f),u+=m+a}),c+=d,l.push({width:d,height:u}),c}adjustHitBoxes(){if(!this.options.display)return;const t=this._computeTitleHeight(),{legendHitBoxes:e,options:{align:i,labels:{padding:s},rtl:o}}=this,n=mo(o,this.left,this.width);if(this.isHorizontal()){let o=0,a=Vi(i,this.left+s,this.right-this.lineWidths[o]);for(const r of e)o!==r.row&&(o=r.row,a=Vi(i,this.left+s,this.right-this.lineWidths[o])),r.top+=this.top+t+s,r.left=n.leftForLtr(n.x(a),r.width),a+=r.width+s}else{let o=0,a=Vi(i,this.top+t+s,this.bottom-this.columnSizes[o].height);for(const r of e)r.col!==o&&(o=r.col,a=Vi(i,this.top+t+s,this.bottom-this.columnSizes[o].height)),r.top=a,r.left+=this.left+s,r.left=n.leftForLtr(n.x(r.left),r.width),a+=r.height+s}}isHorizontal(){return"top"===this.options.position||"bottom"===this.options.position}draw(){if(this.options.display){const t=this.ctx;gs(t,this),this._draw(),fs(t)}}_draw(){const{options:t,columnSizes:e,lineWidths:i,ctx:s}=this,{align:o,labels:n}=t,a=as.color,r=mo(t.rtl,this.left,this.width),l=$s(n.font),{padding:h}=n,c=l.size,d=c/2;let u;this.drawTitle(),s.textAlign=r.textAlign("left"),s.textBaseline="middle",s.lineWidth=.5,s.font=l.string;const{boxWidth:p,boxHeight:g,itemHeight:f}=Ir(n,c),m=this.isHorizontal(),b=this._computeTitleHeight();u=m?{x:Vi(o,this.left+h,this.right-i[0]),y:this.top+h+b,line:0}:{x:this.left+h,y:Vi(o,this.top+b+h,this.bottom-e[0].height),line:0},bo(this.ctx,t.textDirection);const x=f+h;this.legendItems.forEach((v,_)=>{s.strokeStyle=v.fontColor,s.fillStyle=v.fontColor;const y=s.measureText(v.text).width,w=r.textAlign(v.textAlign||(v.textAlign=n.textAlign)),k=p+d+y;let C=u.x,M=u.y;r.setWidth(this.width),m?_>0&&C+k+h>this.right&&(M=u.y+=x,u.line++,C=u.x=Vi(o,this.left+h,this.right-i[u.line])):_>0&&M+x>this.bottom&&(C=u.x=C+e[u.line].width+h,u.line++,M=u.y=Vi(o,this.top+b+h,this.bottom-e[u.line].height));if(function(t,e,i){if(isNaN(p)||p<=0||isNaN(g)||g<0)return;s.save();const o=We(i.lineWidth,1);if(s.fillStyle=We(i.fillStyle,a),s.lineCap=We(i.lineCap,"butt"),s.lineDashOffset=We(i.lineDashOffset,0),s.lineJoin=We(i.lineJoin,"miter"),s.lineWidth=o,s.strokeStyle=We(i.strokeStyle,a),s.setLineDash(We(i.lineDash,[])),n.usePointStyle){const a={radius:g*Math.SQRT2/2,pointStyle:i.pointStyle,rotation:i.rotation,borderWidth:o},l=r.xPlus(t,p/2);us(s,a,l,e+d,n.pointStyleWidth&&p)}else{const n=e+Math.max((c-g)/2,0),a=r.leftForLtr(t,p),l=As(i.borderRadius);s.beginPath(),Object.values(l).some(t=>0!==t)?ys(s,{x:a,y:n,w:p,h:g,radius:l}):s.rect(a,n,p,g),s.fill(),0!==o&&s.stroke()}s.restore()}(r.x(C),M,v),C=((t,e,i,s)=>t===(s?"left":"right")?i:"center"===t?(e+i)/2:e)(w,C+p+d,m?C+k:this.right,t.rtl),function(t,e,i){_s(s,i.text,t,e+f/2,l,{strikethrough:i.hidden,textAlign:r.textAlign(i.textAlign)})}(r.x(C),M,v),m)u.x+=k+h;else if("string"!=typeof v.text){const t=l.lineHeight;u.y+=Vr(v,t)+h}else u.y+=x}),xo(this.ctx,t.textDirection)}drawTitle(){const t=this.options,e=t.title,i=$s(e.font),s=Es(e.padding);if(!e.display)return;const o=mo(t.rtl,this.left,this.width),n=this.ctx,a=e.position,r=i.size/2,l=s.top+r;let h,c=this.left,d=this.width;if(this.isHorizontal())d=Math.max(...this.lineWidths),h=this.top+l,c=Vi(t.align,c,this.right-d);else{const e=this.columnSizes.reduce((t,e)=>Math.max(t,e.height),0);h=l+Vi(t.align,this.top,this.bottom-e-t.labels.padding-this._computeTitleHeight())}const u=Vi(a,c,c+d);n.textAlign=o.textAlign(Fi(a)),n.textBaseline="middle",n.strokeStyle=e.color,n.fillStyle=e.color,n.font=i.string,_s(n,e.text,u,h,i)}_computeTitleHeight(){const t=this.options.title,e=$s(t.font),i=Es(t.padding);return t.display?e.lineHeight+i.height:0}_getLegendItemAt(t,e){let i,s,o;if(Ei(t,this.left,this.right)&&Ei(e,this.top,this.bottom))for(o=this.legendHitBoxes,i=0;i<o.length;++i)if(s=o[i],Ei(t,s.left,s.left+s.width)&&Ei(e,s.top,s.top+s.height))return this.legendItems[i];return null}handleEvent(t){const e=this.options;if(!function(t,e){if(("mousemove"===t||"mouseout"===t)&&(e.onHover||e.onLeave))return!0;if(e.onClick&&("click"===t||"mouseup"===t))return!0;return!1}(t.type,e))return;const i=this._getLegendItemAt(t.x,t.y);if("mousemove"===t.type||"mouseout"===t.type){const n=this._hoveredItem,a=(o=i,null!==(s=n)&&null!==o&&s.datasetIndex===o.datasetIndex&&s.index===o.index);n&&!a&&Ue(e.onLeave,[t,n,this],this),this._hoveredItem=i,i&&!a&&Ue(e.onHover,[t,i,this],this)}else i&&Ue(e.onClick,[t,i,this],this);var s,o}}function Vr(t,e){return e*(t.text?t.text.length:0)}var Hr={id:"legend",_element:Fr,start(t,e,i){const s=t.legend=new Fr({ctx:t.ctx,options:i,chart:t});On.configure(t,s,i),On.addBox(t,s)},stop(t){On.removeBox(t,t.legend),delete t.legend},beforeUpdate(t,e,i){const s=t.legend;On.configure(t,s,i),s.options=i},afterUpdate(t){const e=t.legend;e.buildLabels(),e.adjustHitBoxes()},afterEvent(t,e){e.replay||t.legend.handleEvent(e.event)},defaults:{display:!0,position:"top",align:"center",fullSize:!0,reverse:!1,weight:1e3,onClick(t,e,i){const s=e.datasetIndex,o=i.chart;o.isDatasetVisible(s)?(o.hide(s),e.hidden=!0):(o.show(s),e.hidden=!1)},onHover:null,onLeave:null,labels:{color:t=>t.chart.options.color,boxWidth:40,padding:10,generateLabels(t){const e=t.data.datasets,{labels:{usePointStyle:i,pointStyle:s,textAlign:o,color:n,useBorderRadius:a,borderRadius:r}}=t.legend.options;return t._getSortedDatasetMetas().map(t=>{const l=t.controller.getStyle(i?0:void 0),h=Es(l.borderWidth);return{text:e[t.index].label,fillStyle:l.backgroundColor,fontColor:n,hidden:!t.visible,lineCap:l.borderCapStyle,lineDash:l.borderDash,lineDashOffset:l.borderDashOffset,lineJoin:l.borderJoinStyle,lineWidth:(h.width+h.height)/4,strokeStyle:l.borderColor,pointStyle:s||l.pointStyle,rotation:l.rotation,textAlign:o||l.textAlign,borderRadius:a&&(r||l.borderRadius),datasetIndex:t.index}},this)}},title:{color:t=>t.chart.options.color,display:!1,position:"center",text:""}},descriptors:{_scriptable:t=>!t.startsWith("on"),labels:{_scriptable:t=>!["generateLabels","filter","sort"].includes(t)}}};class Nr extends Kn{constructor(t){super(),this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this._padding=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e){const i=this.options;if(this.left=0,this.top=0,!i.display)return void(this.width=this.height=this.right=this.bottom=0);this.width=this.right=t,this.height=this.bottom=e;const s=Ve(i.text)?i.text.length:1;this._padding=Es(i.padding);const o=s*$s(i.font).lineHeight+this._padding.height;this.isHorizontal()?this.height=o:this.width=o}isHorizontal(){const t=this.options.position;return"top"===t||"bottom"===t}_drawArgs(t){const{top:e,left:i,bottom:s,right:o,options:n}=this,a=n.align;let r,l,h,c=0;return this.isHorizontal()?(l=Vi(a,i,o),h=e+t,r=o-i):("left"===n.position?(l=i+t,h=Vi(a,s,e),c=-.5*ai):(l=o-t,h=Vi(a,e,s),c=.5*ai),r=s-e),{titleX:l,titleY:h,maxWidth:r,rotation:c}}draw(){const t=this.ctx,e=this.options;if(!e.display)return;const i=$s(e.font),s=i.lineHeight/2+this._padding.top,{titleX:o,titleY:n,maxWidth:a,rotation:r}=this._drawArgs(s);_s(t,e.text,0,0,i,{color:e.color,maxWidth:a,rotation:r,textAlign:Fi(e.align),textBaseline:"middle",translation:[o,n]})}}var Br={id:"title",_element:Nr,start(t,e,i){!function(t,e){const i=new Nr({ctx:t.ctx,options:e,chart:t});On.configure(t,i,e),On.addBox(t,i),t.titleBlock=i}(t,i)},stop(t){const e=t.titleBlock;On.removeBox(t,e),delete t.titleBlock},beforeUpdate(t,e,i){const s=t.titleBlock;On.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"bold"},fullSize:!0,padding:10,position:"top",text:"",weight:2e3},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const Wr=new WeakMap;var jr={id:"subtitle",start(t,e,i){const s=new Nr({ctx:t.ctx,options:i,chart:t});On.configure(t,s,i),On.addBox(t,s),Wr.set(t,s)},stop(t){On.removeBox(t,Wr.get(t)),Wr.delete(t)},beforeUpdate(t,e,i){const s=Wr.get(t);On.configure(t,s,i),s.options=i},defaults:{align:"center",display:!1,font:{weight:"normal"},fullSize:!0,padding:0,position:"top",text:"",weight:1500},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const Ur={average(t){if(!t.length)return!1;let e,i,s=new Set,o=0,n=0;for(e=0,i=t.length;e<i;++e){const i=t[e].element;if(i&&i.hasValue()){const t=i.tooltipPosition();s.add(t.x),o+=t.y,++n}}if(0===n||0===s.size)return!1;return{x:[...s].reduce((t,e)=>t+e)/s.size,y:o/n}},nearest(t,e){if(!t.length)return!1;let i,s,o,n=e.x,a=e.y,r=Number.POSITIVE_INFINITY;for(i=0,s=t.length;i<s;++i){const s=t[i].element;if(s&&s.hasValue()){const t=Ci(e,s.getCenterPoint());t<r&&(r=t,o=s)}}if(o){const t=o.tooltipPosition();n=t.x,a=t.y}return{x:n,y:a}}};function Yr(t,e){return e&&(Ve(e)?Array.prototype.push.apply(t,e):t.push(e)),t}function Xr(t){return("string"==typeof t||t instanceof String)&&t.indexOf("\n")>-1?t.split("\n"):t}function qr(t,e){const{element:i,datasetIndex:s,index:o}=e,n=t.getDatasetMeta(s).controller,{label:a,value:r}=n.getLabelAndValue(o);return{chart:t,label:a,parsed:n.getParsed(o),raw:t.data.datasets[s].data[o],formattedValue:r,dataset:n.getDataset(),dataIndex:o,datasetIndex:s,element:i}}function Gr(t,e){const i=t.chart.ctx,{body:s,footer:o,title:n}=t,{boxWidth:a,boxHeight:r}=e,l=$s(e.bodyFont),h=$s(e.titleFont),c=$s(e.footerFont),d=n.length,u=o.length,p=s.length,g=Es(e.padding);let f=g.height,m=0,b=s.reduce((t,e)=>t+e.before.length+e.lines.length+e.after.length,0);if(b+=t.beforeBody.length+t.afterBody.length,d&&(f+=d*h.lineHeight+(d-1)*e.titleSpacing+e.titleMarginBottom),b){f+=p*(e.displayColors?Math.max(r,l.lineHeight):l.lineHeight)+(b-p)*l.lineHeight+(b-1)*e.bodySpacing}u&&(f+=e.footerMarginTop+u*c.lineHeight+(u-1)*e.footerSpacing);let x=0;const v=function(t){m=Math.max(m,i.measureText(t).width+x)};return i.save(),i.font=h.string,Ye(t.title,v),i.font=l.string,Ye(t.beforeBody.concat(t.afterBody),v),x=e.displayColors?a+2+e.boxPadding:0,Ye(s,t=>{Ye(t.before,v),Ye(t.lines,v),Ye(t.after,v)}),x=0,i.font=c.string,Ye(t.footer,v),i.restore(),m+=g.width,{width:m,height:f}}function Kr(t,e,i,s){const{x:o,width:n}=i,{width:a,chartArea:{left:r,right:l}}=t;let h="center";return"center"===s?h=o<=(r+l)/2?"left":"right":o<=n/2?h="left":o>=a-n/2&&(h="right"),function(t,e,i,s){const{x:o,width:n}=s,a=i.caretSize+i.caretPadding;return"left"===t&&o+n+a>e.width||"right"===t&&o-n-a<0||void 0}(h,t,e,i)&&(h="center"),h}function Jr(t,e,i){const s=i.yAlign||e.yAlign||function(t,e){const{y:i,height:s}=e;return i<s/2?"top":i>t.height-s/2?"bottom":"center"}(t,i);return{xAlign:i.xAlign||e.xAlign||Kr(t,e,i,s),yAlign:s}}function Zr(t,e,i,s){const{caretSize:o,caretPadding:n,cornerRadius:a}=t,{xAlign:r,yAlign:l}=i,h=o+n,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:p}=As(a);let g=function(t,e){let{x:i,width:s}=t;return"right"===e?i-=s:"center"===e&&(i-=s/2),i}(e,r);const f=function(t,e,i){let{y:s,height:o}=t;return"top"===e?s+=i:s-="bottom"===e?o+i:o/2,s}(e,l,h);return"center"===l?"left"===r?g+=h:"right"===r&&(g-=h):"left"===r?g-=Math.max(c,u)+o:"right"===r&&(g+=Math.max(d,p)+o),{x:Ai(g,0,s.width-e.width),y:Ai(f,0,s.height-e.height)}}function Qr(t,e,i){const s=Es(i.padding);return"center"===e?t.x+t.width/2:"right"===e?t.x+t.width-s.right:t.x+s.left}function tl(t){return Yr([],Xr(t))}function el(t,e){const i=e&&e.dataset&&e.dataset.tooltip&&e.dataset.tooltip.callbacks;return i?t.override(i):t}const il={beforeTitle:ze,title(t){if(t.length>0){const e=t[0],i=e.chart.data.labels,s=i?i.length:0;if(this&&this.options&&"dataset"===this.options.mode)return e.dataset.label||"";if(e.label)return e.label;if(s>0&&e.dataIndex<s)return i[e.dataIndex]}return""},afterTitle:ze,beforeBody:ze,beforeLabel:ze,label(t){if(this&&this.options&&"dataset"===this.options.mode)return t.label+": "+t.formattedValue||t.formattedValue;let e=t.dataset.label||"";e&&(e+=": ");const i=t.formattedValue;return Fe(i)||(e+=i),e},labelColor(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{borderColor:e.borderColor,backgroundColor:e.backgroundColor,borderWidth:e.borderWidth,borderDash:e.borderDash,borderDashOffset:e.borderDashOffset,borderRadius:0}},labelTextColor(){return this.options.bodyColor},labelPointStyle(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{pointStyle:e.pointStyle,rotation:e.rotation}},afterLabel:ze,afterBody:ze,beforeFooter:ze,footer:ze,afterFooter:ze};function sl(t,e,i,s){const o=t[e].call(i,s);return void 0===o?il[e].call(i,s):o}class ol extends Kn{constructor(t){super(),this.opacity=0,this._active=[],this._eventPosition=void 0,this._size=void 0,this._cachedAnimations=void 0,this._tooltipItems=[],this.$animations=void 0,this.$context=void 0,this.chart=t.chart,this.options=t.options,this.dataPoints=void 0,this.title=void 0,this.beforeBody=void 0,this.body=void 0,this.afterBody=void 0,this.footer=void 0,this.xAlign=void 0,this.yAlign=void 0,this.x=void 0,this.y=void 0,this.height=void 0,this.width=void 0,this.caretX=void 0,this.caretY=void 0,this.labelColors=void 0,this.labelPointStyles=void 0,this.labelTextColors=void 0}initialize(t){this.options=t,this._cachedAnimations=void 0,this.$context=void 0}_resolveAnimations(){const t=this._cachedAnimations;if(t)return t;const e=this.chart,i=this.options.setContext(this.getContext()),s=i.enabled&&e.options.animation&&i.animations,o=new To(this.chart,s);return s._cacheable&&(this._cachedAnimations=Object.freeze(o)),o}getContext(){return this.$context||(this.$context=(t=this.chart.getContext(),e=this,i=this._tooltipItems,Os(t,{tooltip:e,tooltipItems:i,type:"tooltip"})));var t,e,i}getTitle(t,e){const{callbacks:i}=e,s=sl(i,"beforeTitle",this,t),o=sl(i,"title",this,t),n=sl(i,"afterTitle",this,t);let a=[];return a=Yr(a,Xr(s)),a=Yr(a,Xr(o)),a=Yr(a,Xr(n)),a}getBeforeBody(t,e){return tl(sl(e.callbacks,"beforeBody",this,t))}getBody(t,e){const{callbacks:i}=e,s=[];return Ye(t,t=>{const e={before:[],lines:[],after:[]},o=el(i,t);Yr(e.before,Xr(sl(o,"beforeLabel",this,t))),Yr(e.lines,sl(o,"label",this,t)),Yr(e.after,Xr(sl(o,"afterLabel",this,t))),s.push(e)}),s}getAfterBody(t,e){return tl(sl(e.callbacks,"afterBody",this,t))}getFooter(t,e){const{callbacks:i}=e,s=sl(i,"beforeFooter",this,t),o=sl(i,"footer",this,t),n=sl(i,"afterFooter",this,t);let a=[];return a=Yr(a,Xr(s)),a=Yr(a,Xr(o)),a=Yr(a,Xr(n)),a}_createItems(t){const e=this._active,i=this.chart.data,s=[],o=[],n=[];let a,r,l=[];for(a=0,r=e.length;a<r;++a)l.push(qr(this.chart,e[a]));return t.filter&&(l=l.filter((e,s,o)=>t.filter(e,s,o,i))),t.itemSort&&(l=l.sort((e,s)=>t.itemSort(e,s,i))),Ye(l,e=>{const i=el(t.callbacks,e);s.push(sl(i,"labelColor",this,e)),o.push(sl(i,"labelPointStyle",this,e)),n.push(sl(i,"labelTextColor",this,e))}),this.labelColors=s,this.labelPointStyles=o,this.labelTextColors=n,this.dataPoints=l,l}update(t,e){const i=this.options.setContext(this.getContext()),s=this._active;let o,n=[];if(s.length){const t=Ur[i.position].call(this,s,this._eventPosition);n=this._createItems(i),this.title=this.getTitle(n,i),this.beforeBody=this.getBeforeBody(n,i),this.body=this.getBody(n,i),this.afterBody=this.getAfterBody(n,i),this.footer=this.getFooter(n,i);const e=this._size=Gr(this,i),a=Object.assign({},t,e),r=Jr(this.chart,i,a),l=Zr(i,a,r,this.chart);this.xAlign=r.xAlign,this.yAlign=r.yAlign,o={opacity:1,x:l.x,y:l.y,width:e.width,height:e.height,caretX:t.x,caretY:t.y}}else 0!==this.opacity&&(o={opacity:0});this._tooltipItems=n,this.$context=void 0,o&&this._resolveAnimations().update(this,o),t&&i.external&&i.external.call(this,{chart:this.chart,tooltip:this,replay:e})}drawCaret(t,e,i,s){const o=this.getCaretPosition(t,i,s);e.lineTo(o.x1,o.y1),e.lineTo(o.x2,o.y2),e.lineTo(o.x3,o.y3)}getCaretPosition(t,e,i){const{xAlign:s,yAlign:o}=this,{caretSize:n,cornerRadius:a}=i,{topLeft:r,topRight:l,bottomLeft:h,bottomRight:c}=As(a),{x:d,y:u}=t,{width:p,height:g}=e;let f,m,b,x,v,_;return"center"===o?(v=u+g/2,"left"===s?(f=d,m=f-n,x=v+n,_=v-n):(f=d+p,m=f+n,x=v-n,_=v+n),b=f):(m="left"===s?d+Math.max(r,h)+n:"right"===s?d+p-Math.max(l,c)-n:this.caretX,"top"===o?(x=u,v=x-n,f=m-n,b=m+n):(x=u+g,v=x+n,f=m+n,b=m-n),_=x),{x1:f,x2:m,x3:b,y1:x,y2:v,y3:_}}drawTitle(t,e,i){const s=this.title,o=s.length;let n,a,r;if(o){const l=mo(i.rtl,this.x,this.width);for(t.x=Qr(this,i.titleAlign,i),e.textAlign=l.textAlign(i.titleAlign),e.textBaseline="middle",n=$s(i.titleFont),a=i.titleSpacing,e.fillStyle=i.titleColor,e.font=n.string,r=0;r<o;++r)e.fillText(s[r],l.x(t.x),t.y+n.lineHeight/2),t.y+=n.lineHeight+a,r+1===o&&(t.y+=i.titleMarginBottom-a)}}_drawColorBox(t,e,i,s,o){const n=this.labelColors[i],a=this.labelPointStyles[i],{boxHeight:r,boxWidth:l}=o,h=$s(o.bodyFont),c=Qr(this,"left",o),d=s.x(c),u=r<h.lineHeight?(h.lineHeight-r)/2:0,p=e.y+u;if(o.usePointStyle){const e={radius:Math.min(l,r)/2,pointStyle:a.pointStyle,rotation:a.rotation,borderWidth:1},i=s.leftForLtr(d,l)+l/2,h=p+r/2;t.strokeStyle=o.multiKeyBackground,t.fillStyle=o.multiKeyBackground,ds(t,e,i,h),t.strokeStyle=n.borderColor,t.fillStyle=n.backgroundColor,ds(t,e,i,h)}else{t.lineWidth=He(n.borderWidth)?Math.max(...Object.values(n.borderWidth)):n.borderWidth||1,t.strokeStyle=n.borderColor,t.setLineDash(n.borderDash||[]),t.lineDashOffset=n.borderDashOffset||0;const e=s.leftForLtr(d,l),i=s.leftForLtr(s.xPlus(d,1),l-2),a=As(n.borderRadius);Object.values(a).some(t=>0!==t)?(t.beginPath(),t.fillStyle=o.multiKeyBackground,ys(t,{x:e,y:p,w:l,h:r,radius:a}),t.fill(),t.stroke(),t.fillStyle=n.backgroundColor,t.beginPath(),ys(t,{x:i,y:p+1,w:l-2,h:r-2,radius:a}),t.fill()):(t.fillStyle=o.multiKeyBackground,t.fillRect(e,p,l,r),t.strokeRect(e,p,l,r),t.fillStyle=n.backgroundColor,t.fillRect(i,p+1,l-2,r-2))}t.fillStyle=this.labelTextColors[i]}drawBody(t,e,i){const{body:s}=this,{bodySpacing:o,bodyAlign:n,displayColors:a,boxHeight:r,boxWidth:l,boxPadding:h}=i,c=$s(i.bodyFont);let d=c.lineHeight,u=0;const p=mo(i.rtl,this.x,this.width),g=function(i){e.fillText(i,p.x(t.x+u),t.y+d/2),t.y+=d+o},f=p.textAlign(n);let m,b,x,v,_,y,w;for(e.textAlign=n,e.textBaseline="middle",e.font=c.string,t.x=Qr(this,f,i),e.fillStyle=i.bodyColor,Ye(this.beforeBody,g),u=a&&"right"!==f?"center"===n?l/2+h:l+2+h:0,v=0,y=s.length;v<y;++v){for(m=s[v],b=this.labelTextColors[v],e.fillStyle=b,Ye(m.before,g),x=m.lines,a&&x.length&&(this._drawColorBox(e,t,v,p,i),d=Math.max(c.lineHeight,r)),_=0,w=x.length;_<w;++_)g(x[_]),d=c.lineHeight;Ye(m.after,g)}u=0,d=c.lineHeight,Ye(this.afterBody,g),t.y-=o}drawFooter(t,e,i){const s=this.footer,o=s.length;let n,a;if(o){const r=mo(i.rtl,this.x,this.width);for(t.x=Qr(this,i.footerAlign,i),t.y+=i.footerMarginTop,e.textAlign=r.textAlign(i.footerAlign),e.textBaseline="middle",n=$s(i.footerFont),e.fillStyle=i.footerColor,e.font=n.string,a=0;a<o;++a)e.fillText(s[a],r.x(t.x),t.y+n.lineHeight/2),t.y+=n.lineHeight+i.footerSpacing}}drawBackground(t,e,i,s){const{xAlign:o,yAlign:n}=this,{x:a,y:r}=t,{width:l,height:h}=i,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:p}=As(s.cornerRadius);e.fillStyle=s.backgroundColor,e.strokeStyle=s.borderColor,e.lineWidth=s.borderWidth,e.beginPath(),e.moveTo(a+c,r),"top"===n&&this.drawCaret(t,e,i,s),e.lineTo(a+l-d,r),e.quadraticCurveTo(a+l,r,a+l,r+d),"center"===n&&"right"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+l,r+h-p),e.quadraticCurveTo(a+l,r+h,a+l-p,r+h),"bottom"===n&&this.drawCaret(t,e,i,s),e.lineTo(a+u,r+h),e.quadraticCurveTo(a,r+h,a,r+h-u),"center"===n&&"left"===o&&this.drawCaret(t,e,i,s),e.lineTo(a,r+c),e.quadraticCurveTo(a,r,a+c,r),e.closePath(),e.fill(),s.borderWidth>0&&e.stroke()}_updateAnimationTarget(t){const e=this.chart,i=this.$animations,s=i&&i.x,o=i&&i.y;if(s||o){const i=Ur[t.position].call(this,this._active,this._eventPosition);if(!i)return;const n=this._size=Gr(this,t),a=Object.assign({},i,this._size),r=Jr(e,t,a),l=Zr(t,a,r,e);s._to===l.x&&o._to===l.y||(this.xAlign=r.xAlign,this.yAlign=r.yAlign,this.width=n.width,this.height=n.height,this.caretX=i.x,this.caretY=i.y,this._resolveAnimations().update(this,l))}}_willRender(){return!!this.opacity}draw(t){const e=this.options.setContext(this.getContext());let i=this.opacity;if(!i)return;this._updateAnimationTarget(e);const s={width:this.width,height:this.height},o={x:this.x,y:this.y};i=Math.abs(i)<.001?0:i;const n=Es(e.padding),a=this.title.length||this.beforeBody.length||this.body.length||this.afterBody.length||this.footer.length;e.enabled&&a&&(t.save(),t.globalAlpha=i,this.drawBackground(o,t,s,e),bo(t,e.textDirection),o.y+=n.top,this.drawTitle(o,t,e),this.drawBody(o,t,e),this.drawFooter(o,t,e),xo(t,e.textDirection),t.restore())}getActiveElements(){return this._active||[]}setActiveElements(t,e){const i=this._active,s=t.map(({datasetIndex:t,index:e})=>{const i=this.chart.getDatasetMeta(t);if(!i)throw new Error("Cannot find a dataset at index "+t);return{datasetIndex:t,element:i.data[e],index:e}}),o=!Xe(i,s),n=this._positionChanged(s,e);(o||n)&&(this._active=s,this._eventPosition=e,this._ignoreReplayEvents=!0,this.update(!0))}handleEvent(t,e,i=!0){if(e&&this._ignoreReplayEvents)return!1;this._ignoreReplayEvents=!1;const s=this.options,o=this._active||[],n=this._getActiveElements(t,o,e,i),a=this._positionChanged(n,t),r=e||!Xe(n,o)||a;return r&&(this._active=n,(s.enabled||s.external)&&(this._eventPosition={x:t.x,y:t.y},this.update(!0,e))),r}_getActiveElements(t,e,i,s){const o=this.options;if("mouseout"===t.type)return[];if(!s)return e.filter(t=>this.chart.data.datasets[t.datasetIndex]&&void 0!==this.chart.getDatasetMeta(t.datasetIndex).controller.getParsed(t.index));const n=this.chart.getElementsAtEventForMode(t,o.mode,o,i);return o.reverse&&n.reverse(),n}_positionChanged(t,e){const{caretX:i,caretY:s,options:o}=this,n=Ur[o.position].call(this,t,e);return!1!==n&&(i!==n.x||s!==n.y)}}s(ol,"positioners",Ur);var nl={id:"tooltip",_element:ol,positioners:Ur,afterInit(t,e,i){i&&(t.tooltip=new ol({chart:t,options:i}))},beforeUpdate(t,e,i){t.tooltip&&t.tooltip.initialize(i)},reset(t,e,i){t.tooltip&&t.tooltip.initialize(i)},afterDraw(t){const e=t.tooltip;if(e&&e._willRender()){const i={tooltip:e};if(!1===t.notifyPlugins("beforeTooltipDraw",{...i,cancelable:!0}))return;e.draw(t.ctx),t.notifyPlugins("afterTooltipDraw",i)}},afterEvent(t,e){if(t.tooltip){const i=e.replay;t.tooltip.handleEvent(e.event,i,e.inChartArea)&&(e.changed=!0)}},defaults:{enabled:!0,external:null,position:"average",backgroundColor:"rgba(0,0,0,0.8)",titleColor:"#fff",titleFont:{weight:"bold"},titleSpacing:2,titleMarginBottom:6,titleAlign:"left",bodyColor:"#fff",bodySpacing:2,bodyFont:{},bodyAlign:"left",footerColor:"#fff",footerSpacing:2,footerMarginTop:6,footerFont:{weight:"bold"},footerAlign:"left",padding:6,caretPadding:2,caretSize:5,cornerRadius:6,boxHeight:(t,e)=>e.bodyFont.size,boxWidth:(t,e)=>e.bodyFont.size,multiKeyBackground:"#fff",displayColors:!0,boxPadding:0,borderColor:"rgba(0,0,0,0)",borderWidth:0,animation:{duration:400,easing:"easeOutQuart"},animations:{numbers:{type:"number",properties:["x","y","width","height","caretX","caretY"]},opacity:{easing:"linear",duration:200}},callbacks:il},defaultRoutes:{bodyFont:"font",footerFont:"font",titleFont:"font"},descriptors:{_scriptable:t=>"filter"!==t&&"itemSort"!==t&&"external"!==t,_indexable:!1,callbacks:{_scriptable:!1,_indexable:!1},animation:{_fallback:!1},animations:{_fallback:"animation"}},additionalOptionScopes:["interaction"]},al=Object.freeze({__proto__:null,Colors:fr,Decimation:xr,Filler:zr,Legend:Hr,SubTitle:jr,Title:Br,Tooltip:nl});function rl(t,e,i,s){const o=t.indexOf(e);if(-1===o)return((t,e,i,s)=>("string"==typeof e?(i=t.push(e)-1,s.unshift({index:i,label:e})):isNaN(e)&&(i=null),i))(t,e,i,s);return o!==t.lastIndexOf(e)?i:o}function ll(t){const e=this.getLabels();return t>=0&&t<e.length?e[t]:t}class hl extends aa{constructor(t){super(t),this._startValue=void 0,this._valueRange=0,this._addedLabels=[]}init(t){const e=this._addedLabels;if(e.length){const t=this.getLabels();for(const{index:i,label:s}of e)t[i]===s&&t.splice(i,1);this._addedLabels=[]}super.init(t)}parse(t,e){if(Fe(t))return null;const i=this.getLabels();return((t,e)=>null===t?null:Ai(Math.round(t),0,e))(e=isFinite(e)&&i[e]===t?e:rl(i,t,We(e,t),this._addedLabels),i.length-1)}determineDataLimits(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let{min:i,max:s}=this.getMinMax(!0);"ticks"===this.options.bounds&&(t||(i=0),e||(s=this.getLabels().length-1)),this.min=i,this.max=s}buildTicks(){const t=this.min,e=this.max,i=this.options.offset,s=[];let o=this.getLabels();o=0===t&&e===o.length-1?o:o.slice(t,e+1),this._valueRange=Math.max(o.length-(i?0:1),1),this._startValue=this.min-(i?.5:0);for(let n=t;n<=e;n++)s.push({value:n});return s}getLabelForValue(t){return ll.call(this,t)}configure(){super.configure(),this.isHorizontal()||(this._reversePixels=!this._reversePixels)}getPixelForValue(t){return"number"!=typeof t&&(t=this.parse(t)),null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getValueForPixel(t){return Math.round(this._startValue+this.getDecimalForPixel(t)*this._valueRange)}getBasePixel(){return this.bottom}}function cl(t,e){const i=[],{bounds:s,step:o,min:n,max:a,precision:r,count:l,maxTicks:h,maxDigits:c,includeBounds:d}=t,u=o||1,p=h-1,{min:g,max:f}=e,m=!Fe(n),b=!Fe(a),x=!Fe(l),v=(f-g)/(c+1);let _,y,w,k,C=bi((f-g)/p/u)*u;if(C<1e-14&&!m&&!b)return[{value:g},{value:f}];k=Math.ceil(f/C)-Math.floor(g/C),k>p&&(C=bi(k*C/p/u)*u),Fe(r)||(_=Math.pow(10,r),C=Math.ceil(C*_)/_),"ticks"===s?(y=Math.floor(g/C)*C,w=Math.ceil(f/C)*C):(y=g,w=f),m&&b&&o&&function(t,e){const i=Math.round(t);return i-e<=t&&i+e>=t}((a-n)/o,C/1e3)?(k=Math.round(Math.min((a-n)/C,h)),C=(a-n)/k,y=n,w=a):x?(y=m?n:y,w=b?a:w,k=l-1,C=(w-y)/k):(k=(w-y)/C,k=mi(k,Math.round(k),C/1e3)?Math.round(k):Math.ceil(k));const M=Math.max(wi(C),wi(y));_=Math.pow(10,Fe(r)?M:r),y=Math.round(y*_)/_,w=Math.round(w*_)/_;let S=0;for(m&&(d&&y!==n?(i.push({value:n}),y<n&&S++,mi(Math.round((y+S*C)*_)/_,n,dl(n,v,t))&&S++):y<n&&S++);S<k;++S){const t=Math.round((y+S*C)*_)/_;if(b&&t>a)break;i.push({value:t})}return b&&d&&w!==a?i.length&&mi(i[i.length-1].value,a,dl(a,v,t))?i[i.length-1].value=a:i.push({value:a}):b&&w!==a||i.push({value:w}),i}function dl(t,e,{horizontal:i,minRotation:s}){const o=_i(s),n=(i?Math.sin(o):Math.cos(o))||.001,a=.75*e*(""+t).length;return Math.min(e/n,a)}s(hl,"id","category"),s(hl,"defaults",{ticks:{callback:ll}});class ul extends aa{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._endValue=void 0,this._valueRange=0}parse(t,e){return Fe(t)||("number"==typeof t||t instanceof Number)&&!isFinite(+t)?null:+t}handleTickRangeOptions(){const{beginAtZero:t}=this.options,{minDefined:e,maxDefined:i}=this.getUserBounds();let{min:s,max:o}=this;const n=t=>s=e?s:t,a=t=>o=i?o:t;if(t){const t=fi(s),e=fi(o);t<0&&e<0?a(0):t>0&&e>0&&n(0)}if(s===o){let e=0===o?1:Math.abs(.05*o);a(o+e),t||n(s-e)}this.min=s,this.max=o}getTickLimit(){const t=this.options.ticks;let e,{maxTicksLimit:i,stepSize:s}=t;return s?(e=Math.ceil(this.max/s)-Math.floor(this.min/s)+1,e>1e3&&(console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`),e=1e3)):(e=this.computeTickLimit(),i=i||11),i&&(e=Math.min(i,e)),e}computeTickLimit(){return Number.POSITIVE_INFINITY}buildTicks(){const t=this.options,e=t.ticks;let i=this.getTickLimit();i=Math.max(2,i);const s=cl({maxTicks:i,bounds:t.bounds,min:t.min,max:t.max,precision:e.precision,step:e.stepSize,count:e.count,maxDigits:this._maxDigits(),horizontal:this.isHorizontal(),minRotation:e.minRotation||0,includeBounds:!1!==e.includeBounds},this._range||this);return"ticks"===t.bounds&&vi(s,this,"value"),t.reverse?(s.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),s}configure(){const t=this.ticks;let e=this.min,i=this.max;if(super.configure(),this.options.offset&&t.length){const s=(i-e)/Math.max(t.length-1,1)/2;e-=s,i+=s}this._startValue=e,this._endValue=i,this._valueRange=i-e}getLabelForValue(t){return Zi(t,this.chart.options.locale,this.options.ticks.format)}}class pl extends ul{determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=Ne(t)?t:0,this.max=Ne(e)?e:1,this.handleTickRangeOptions()}computeTickLimit(){const t=this.isHorizontal(),e=t?this.width:this.height,i=_i(this.options.ticks.minRotation),s=(t?Math.sin(i):Math.cos(i))||.001,o=this._resolveTickFontOptions(0);return Math.ceil(e/Math.min(40,o.lineHeight/s))}getPixelForValue(t){return null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getValueForPixel(t){return this._startValue+this.getDecimalForPixel(t)*this._valueRange}}s(pl,"id","linear"),s(pl,"defaults",{ticks:{callback:ts.formatters.numeric}});const gl=t=>Math.floor(gi(t)),fl=(t,e)=>Math.pow(10,gl(t)+e);function ml(t){return 1===t/Math.pow(10,gl(t))}function bl(t,e,i){const s=Math.pow(10,i),o=Math.floor(t/s);return Math.ceil(e/s)-o}function xl(t,{min:e,max:i}){e=Be(t.min,e);const s=[],o=gl(e);let n=function(t,e){let i=gl(e-t);for(;bl(t,e,i)>10;)i++;for(;bl(t,e,i)<10;)i--;return Math.min(i,gl(t))}(e,i),a=n<0?Math.pow(10,Math.abs(n)):1;const r=Math.pow(10,n),l=o>n?Math.pow(10,o):0,h=Math.round((e-l)*a)/a,c=Math.floor((e-l)/r/10)*r*10;let d=Math.floor((h-c)/Math.pow(10,n)),u=Be(t.min,Math.round((l+c+d*Math.pow(10,n))*a)/a);for(;u<i;)s.push({value:u,major:ml(u),significand:d}),d>=10?d=d<15?15:20:d++,d>=20&&(n++,d=2,a=n>=0?1:a),u=Math.round((l+c+d*Math.pow(10,n))*a)/a;const p=Be(t.max,u);return s.push({value:p,major:ml(p),significand:d}),s}class vl extends aa{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._valueRange=0}parse(t,e){const i=ul.prototype.parse.apply(this,[t,e]);if(0!==i)return Ne(i)&&i>0?i:null;this._zero=!0}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=Ne(t)?Math.max(0,t):null,this.max=Ne(e)?Math.max(0,e):null,this.options.beginAtZero&&(this._zero=!0),this._zero&&this.min!==this._suggestedMin&&!Ne(this._userMin)&&(this.min=t===fl(this.min,0)?fl(this.min,-1):fl(this.min,0)),this.handleTickRangeOptions()}handleTickRangeOptions(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let i=this.min,s=this.max;const o=e=>i=t?i:e,n=t=>s=e?s:t;i===s&&(i<=0?(o(1),n(10)):(o(fl(i,-1)),n(fl(s,1)))),i<=0&&o(fl(s,-1)),s<=0&&n(fl(i,1)),this.min=i,this.max=s}buildTicks(){const t=this.options,e=xl({min:this._userMin,max:this._userMax},this);return"ticks"===t.bounds&&vi(e,this,"value"),t.reverse?(e.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),e}getLabelForValue(t){return void 0===t?"0":Zi(t,this.chart.options.locale,this.options.ticks.format)}configure(){const t=this.min;super.configure(),this._startValue=gi(t),this._valueRange=gi(this.max)-gi(t)}getPixelForValue(t){return void 0!==t&&0!==t||(t=this.min),null===t||isNaN(t)?NaN:this.getPixelForDecimal(t===this.min?0:(gi(t)-this._startValue)/this._valueRange)}getValueForPixel(t){const e=this.getDecimalForPixel(t);return Math.pow(10,this._startValue+e*this._valueRange)}}function _l(t){const e=t.ticks;if(e.display&&t.display){const t=Es(e.backdropPadding);return We(e.font&&e.font.size,as.font.size)+t.height}return 0}function yl(t,e,i){return i=Ve(i)?i:[i],{w:ls(t,e.string,i),h:i.length*e.lineHeight}}function wl(t,e,i,s,o){return t===s||t===o?{start:e-i/2,end:e+i/2}:t<s||t>o?{start:e-i,end:e}:{start:e,end:e+i}}function kl(t){const e={l:t.left+t._padding.left,r:t.right-t._padding.right,t:t.top+t._padding.top,b:t.bottom-t._padding.bottom},i=Object.assign({},e),s=[],o=[],n=t._pointLabels.length,a=t.options.pointLabels,r=a.centerPointLabels?ai/n:0;for(let l=0;l<n;l++){const n=a.setContext(t.getPointLabelContext(l));o[l]=n.padding;const h=t.getPointPosition(l,t.drawingArea+o[l],r),c=$s(n.font),d=yl(t.ctx,c,t._pointLabels[l]);s[l]=d;const u=Si(t.getIndexAngle(l)+r),p=Math.round(yi(u));Cl(i,e,u,wl(p,h.x,d.w,0,180),wl(p,h.y,d.h,90,270))}t.setCenterPoint(e.l-i.l,i.r-e.r,e.t-i.t,i.b-e.b),t._pointLabelItems=function(t,e,i){const s=[],o=t._pointLabels.length,n=t.options,{centerPointLabels:a,display:r}=n.pointLabels,l={extra:_l(n)/2,additionalAngle:a?ai/o:0};let h;for(let c=0;c<o;c++){l.padding=i[c],l.size=e[c];const o=Ml(t,c,l);s.push(o),"auto"===r&&(o.visible=Sl(o,h),o.visible&&(h=o))}return s}(t,s,o)}function Cl(t,e,i,s,o){const n=Math.abs(Math.sin(i)),a=Math.abs(Math.cos(i));let r=0,l=0;s.start<e.l?(r=(e.l-s.start)/n,t.l=Math.min(t.l,e.l-r)):s.end>e.r&&(r=(s.end-e.r)/n,t.r=Math.max(t.r,e.r+r)),o.start<e.t?(l=(e.t-o.start)/a,t.t=Math.min(t.t,e.t-l)):o.end>e.b&&(l=(o.end-e.b)/a,t.b=Math.max(t.b,e.b+l))}function Ml(t,e,i){const s=t.drawingArea,{extra:o,additionalAngle:n,padding:a,size:r}=i,l=t.getPointPosition(e,s+o+a,n),h=Math.round(yi(Si(l.angle+di))),c=function(t,e,i){90===i||270===i?t-=e/2:(i>270||i<90)&&(t-=e);return t}(l.y,r.h,h),d=function(t){if(0===t||180===t)return"center";if(t<180)return"left";return"right"}(h),u=function(t,e,i){"right"===i?t-=e:"center"===i&&(t-=e/2);return t}(l.x,r.w,d);return{visible:!0,x:l.x,y:c,textAlign:d,left:u,top:c,right:u+r.w,bottom:c+r.h}}function Sl(t,e){if(!e)return!0;const{left:i,top:s,right:o,bottom:n}=t;return!(ps({x:i,y:s},e)||ps({x:i,y:n},e)||ps({x:o,y:s},e)||ps({x:o,y:n},e))}function Pl(t,e,i){const{left:s,top:o,right:n,bottom:a}=i,{backdropColor:r}=e;if(!Fe(r)){const i=As(e.borderRadius),l=Es(e.backdropPadding);t.fillStyle=r;const h=s-l.left,c=o-l.top,d=n-s+l.width,u=a-o+l.height;Object.values(i).some(t=>0!==t)?(t.beginPath(),ys(t,{x:h,y:c,w:d,h:u,radius:i}),t.fill()):t.fillRect(h,c,d,u)}}function Al(t,e,i,s){const{ctx:o}=t;if(i)o.arc(t.xCenter,t.yCenter,e,0,ri);else{let i=t.getPointPosition(0,e);o.moveTo(i.x,i.y);for(let n=1;n<s;n++)i=t.getPointPosition(n,e),o.lineTo(i.x,i.y)}}s(vl,"id","logarithmic"),s(vl,"defaults",{ticks:{callback:ts.formatters.logarithmic,major:{enabled:!0}}});class El extends ul{constructor(t){super(t),this.xCenter=void 0,this.yCenter=void 0,this.drawingArea=void 0,this._pointLabels=[],this._pointLabelItems=[]}setDimensions(){const t=this._padding=Es(_l(this.options)/2),e=this.width=this.maxWidth-t.width,i=this.height=this.maxHeight-t.height;this.xCenter=Math.floor(this.left+e/2+t.left),this.yCenter=Math.floor(this.top+i/2+t.top),this.drawingArea=Math.floor(Math.min(e,i)/2)}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!1);this.min=Ne(t)&&!isNaN(t)?t:0,this.max=Ne(e)&&!isNaN(e)?e:0,this.handleTickRangeOptions()}computeTickLimit(){return Math.ceil(this.drawingArea/_l(this.options))}generateTickLabels(t){ul.prototype.generateTickLabels.call(this,t),this._pointLabels=this.getLabels().map((t,e)=>{const i=Ue(this.options.pointLabels.callback,[t,e],this);return i||0===i?i:""}).filter((t,e)=>this.chart.getDataVisibility(e))}fit(){const t=this.options;t.display&&t.pointLabels.display?kl(this):this.setCenterPoint(0,0,0,0)}setCenterPoint(t,e,i,s){this.xCenter+=Math.floor((t-e)/2),this.yCenter+=Math.floor((i-s)/2),this.drawingArea-=Math.min(this.drawingArea/2,Math.max(t,e,i,s))}getIndexAngle(t){return Si(t*(ri/(this._pointLabels.length||1))+_i(this.options.startAngle||0))}getDistanceFromCenterForValue(t){if(Fe(t))return NaN;const e=this.drawingArea/(this.max-this.min);return this.options.reverse?(this.max-t)*e:(t-this.min)*e}getValueForDistanceFromCenter(t){if(Fe(t))return NaN;const e=t/(this.drawingArea/(this.max-this.min));return this.options.reverse?this.max-e:this.min+e}getPointLabelContext(t){const e=this._pointLabels||[];if(t>=0&&t<e.length){const i=e[t];return function(t,e,i){return Os(t,{label:i,index:e,type:"pointLabel"})}(this.getContext(),t,i)}}getPointPosition(t,e,i=0){const s=this.getIndexAngle(t)-di+i;return{x:Math.cos(s)*e+this.xCenter,y:Math.sin(s)*e+this.yCenter,angle:s}}getPointPositionForValue(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))}getBasePosition(t){return this.getPointPositionForValue(t||0,this.getBaseValue())}getPointLabelPosition(t){const{left:e,top:i,right:s,bottom:o}=this._pointLabelItems[t];return{left:e,top:i,right:s,bottom:o}}drawBackground(){const{backgroundColor:t,grid:{circular:e}}=this.options;if(t){const i=this.ctx;i.save(),i.beginPath(),Al(this,this.getDistanceFromCenterForValue(this._endValue),e,this._pointLabels.length),i.closePath(),i.fillStyle=t,i.fill(),i.restore()}}drawGrid(){const t=this.ctx,e=this.options,{angleLines:i,grid:s,border:o}=e,n=this._pointLabels.length;let a,r,l;if(e.pointLabels.display&&function(t,e){const{ctx:i,options:{pointLabels:s}}=t;for(let o=e-1;o>=0;o--){const e=t._pointLabelItems[o];if(!e.visible)continue;const n=s.setContext(t.getPointLabelContext(o));Pl(i,n,e);const a=$s(n.font),{x:r,y:l,textAlign:h}=e;_s(i,t._pointLabels[o],r,l+a.lineHeight/2,a,{color:n.color,textAlign:h,textBaseline:"middle"})}}(this,n),s.display&&this.ticks.forEach((t,e)=>{if(0!==e||0===e&&this.min<0){r=this.getDistanceFromCenterForValue(t.value);const i=this.getContext(e),a=s.setContext(i),l=o.setContext(i);!function(t,e,i,s,o){const n=t.ctx,a=e.circular,{color:r,lineWidth:l}=e;!a&&!s||!r||!l||i<0||(n.save(),n.strokeStyle=r,n.lineWidth=l,n.setLineDash(o.dash||[]),n.lineDashOffset=o.dashOffset,n.beginPath(),Al(t,i,a,s),n.closePath(),n.stroke(),n.restore())}(this,a,r,n,l)}}),i.display){for(t.save(),a=n-1;a>=0;a--){const s=i.setContext(this.getPointLabelContext(a)),{color:o,lineWidth:n}=s;n&&o&&(t.lineWidth=n,t.strokeStyle=o,t.setLineDash(s.borderDash),t.lineDashOffset=s.borderDashOffset,r=this.getDistanceFromCenterForValue(e.reverse?this.min:this.max),l=this.getPointPosition(a,r),t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(l.x,l.y),t.stroke())}t.restore()}}drawBorder(){}drawLabels(){const t=this.ctx,e=this.options,i=e.ticks;if(!i.display)return;const s=this.getIndexAngle(0);let o,n;t.save(),t.translate(this.xCenter,this.yCenter),t.rotate(s),t.textAlign="center",t.textBaseline="middle",this.ticks.forEach((s,a)=>{if(0===a&&this.min>=0&&!e.reverse)return;const r=i.setContext(this.getContext(a)),l=$s(r.font);if(o=this.getDistanceFromCenterForValue(this.ticks[a].value),r.showLabelBackdrop){t.font=l.string,n=t.measureText(s.label).width,t.fillStyle=r.backdropColor;const e=Es(r.backdropPadding);t.fillRect(-n/2-e.left,-o-l.size/2-e.top,n+e.width,l.size+e.height)}_s(t,s.label,0,-o,l,{color:r.color,strokeColor:r.textStrokeColor,strokeWidth:r.textStrokeWidth})}),t.restore()}drawTitle(){}}s(El,"id","radialLinear"),s(El,"defaults",{display:!0,animate:!0,position:"chartArea",angleLines:{display:!0,lineWidth:1,borderDash:[],borderDashOffset:0},grid:{circular:!1},startAngle:0,ticks:{showLabelBackdrop:!0,callback:ts.formatters.numeric},pointLabels:{backdropColor:void 0,backdropPadding:2,display:!0,font:{size:10},callback:t=>t,padding:5,centerPointLabels:!1}}),s(El,"defaultRoutes",{"angleLines.color":"borderColor","pointLabels.color":"color","ticks.color":"color"}),s(El,"descriptors",{angleLines:{_fallback:"grid"}});const $l={millisecond:{common:!0,size:1,steps:1e3},second:{common:!0,size:1e3,steps:60},minute:{common:!0,size:6e4,steps:60},hour:{common:!0,size:36e5,steps:24},day:{common:!0,size:864e5,steps:30},week:{common:!1,size:6048e5,steps:4},month:{common:!0,size:2628e6,steps:12},quarter:{common:!1,size:7884e6,steps:4},year:{common:!0,size:3154e7}},Dl=Object.keys($l);function Ol(t,e){return t-e}function Tl(t,e){if(Fe(e))return null;const i=t._adapter,{parser:s,round:o,isoWeekday:n}=t._parseOpts;let a=e;return"function"==typeof s&&(a=s(a)),Ne(a)||(a="string"==typeof s?i.parse(a,s):i.parse(a)),null===a?null:(o&&(a="week"!==o||!xi(n)&&!0!==n?i.startOf(a,o):i.startOf(a,"isoWeek",n)),+a)}function Ll(t,e,i,s){const o=Dl.length;for(let n=Dl.indexOf(t);n<o-1;++n){const t=$l[Dl[n]],o=t.steps?t.steps:Number.MAX_SAFE_INTEGER;if(t.common&&Math.ceil((i-e)/(o*t.size))<=s)return Dl[n]}return Dl[o-1]}function Rl(t,e,i){if(i){if(i.length){const{lo:s,hi:o}=$i(i,e);t[i[s]>=e?i[s]:i[o]]=!0}}else t[e]=!0}function zl(t,e,i){const s=[],o={},n=e.length;let a,r;for(a=0;a<n;++a)r=e[a],o[r]=a,s.push({value:r,major:!1});return 0!==n&&i?function(t,e,i,s){const o=t._adapter,n=+o.startOf(e[0].value,s),a=e[e.length-1].value;let r,l;for(r=n;r<=a;r=+o.add(r,1,s))l=i[r],l>=0&&(e[l].major=!0);return e}(t,s,o,i):s}class Il extends aa{constructor(t){super(t),this._cache={data:[],labels:[],all:[]},this._unit="day",this._majorUnit=void 0,this._offsets={},this._normalized=!1,this._parseOpts=void 0}init(t,e={}){const i=t.time||(t.time={}),s=this._adapter=new un(t.adapters.date);s.init(e),Ze(i.displayFormats,s.formats()),this._parseOpts={parser:i.parser,round:i.round,isoWeekday:i.isoWeekday},super.init(t),this._normalized=e.normalized}parse(t,e){return void 0===t?null:Tl(this,t)}beforeLayout(){super.beforeLayout(),this._cache={data:[],labels:[],all:[]}}determineDataLimits(){const t=this.options,e=this._adapter,i=t.time.unit||"day";let{min:s,max:o,minDefined:n,maxDefined:a}=this.getUserBounds();function r(t){n||isNaN(t.min)||(s=Math.min(s,t.min)),a||isNaN(t.max)||(o=Math.max(o,t.max))}n&&a||(r(this._getLabelBounds()),"ticks"===t.bounds&&"labels"===t.ticks.source||r(this.getMinMax(!1))),s=Ne(s)&&!isNaN(s)?s:+e.startOf(Date.now(),i),o=Ne(o)&&!isNaN(o)?o:+e.endOf(Date.now(),i)+1,this.min=Math.min(s,o-1),this.max=Math.max(s+1,o)}_getLabelBounds(){const t=this.getLabelTimestamps();let e=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY;return t.length&&(e=t[0],i=t[t.length-1]),{min:e,max:i}}buildTicks(){const t=this.options,e=t.time,i=t.ticks,s="labels"===i.source?this.getLabelTimestamps():this._generate();"ticks"===t.bounds&&s.length&&(this.min=this._userMin||s[0],this.max=this._userMax||s[s.length-1]);const o=this.min,n=function(t,e,i){let s=0,o=t.length;for(;s<o&&t[s]<e;)s++;for(;o>s&&t[o-1]>i;)o--;return s>0||o<t.length?t.slice(s,o):t}(s,o,this.max);return this._unit=e.unit||(i.autoSkip?Ll(e.minUnit,this.min,this.max,this._getLabelCapacity(o)):function(t,e,i,s,o){for(let n=Dl.length-1;n>=Dl.indexOf(i);n--){const i=Dl[n];if($l[i].common&&t._adapter.diff(o,s,i)>=e-1)return i}return Dl[i?Dl.indexOf(i):0]}(this,n.length,e.minUnit,this.min,this.max)),this._majorUnit=i.major.enabled&&"year"!==this._unit?function(t){for(let e=Dl.indexOf(t)+1,i=Dl.length;e<i;++e)if($l[Dl[e]].common)return Dl[e]}(this._unit):void 0,this.initOffsets(s),t.reverse&&n.reverse(),zl(this,n,this._majorUnit)}afterAutoSkip(){this.options.offsetAfterAutoskip&&this.initOffsets(this.ticks.map(t=>+t.value))}initOffsets(t=[]){let e,i,s=0,o=0;this.options.offset&&t.length&&(e=this.getDecimalForValue(t[0]),s=1===t.length?1-e:(this.getDecimalForValue(t[1])-e)/2,i=this.getDecimalForValue(t[t.length-1]),o=1===t.length?i:(i-this.getDecimalForValue(t[t.length-2]))/2);const n=t.length<3?.5:.25;s=Ai(s,0,n),o=Ai(o,0,n),this._offsets={start:s,end:o,factor:1/(s+1+o)}}_generate(){const t=this._adapter,e=this.min,i=this.max,s=this.options,o=s.time,n=o.unit||Ll(o.minUnit,e,i,this._getLabelCapacity(e)),a=We(s.ticks.stepSize,1),r="week"===n&&o.isoWeekday,l=xi(r)||!0===r,h={};let c,d,u=e;if(l&&(u=+t.startOf(u,"isoWeek",r)),u=+t.startOf(u,l?"day":n),t.diff(i,e,n)>1e5*a)throw new Error(e+" and "+i+" are too far apart with stepSize of "+a+" "+n);const p="data"===s.ticks.source&&this.getDataTimestamps();for(c=u,d=0;c<i;c=+t.add(c,a,n),d++)Rl(h,c,p);return c!==i&&"ticks"!==s.bounds&&1!==d||Rl(h,c,p),Object.keys(h).sort(Ol).map(t=>+t)}getLabelForValue(t){const e=this._adapter,i=this.options.time;return i.tooltipFormat?e.format(t,i.tooltipFormat):e.format(t,i.displayFormats.datetime)}format(t,e){const i=this.options.time.displayFormats,s=this._unit,o=e||i[s];return this._adapter.format(t,o)}_tickFormatFunction(t,e,i,s){const o=this.options,n=o.ticks.callback;if(n)return Ue(n,[t,e,i],this);const a=o.time.displayFormats,r=this._unit,l=this._majorUnit,h=r&&a[r],c=l&&a[l],d=i[e],u=l&&c&&d&&d.major;return this._adapter.format(t,s||(u?c:h))}generateTickLabels(t){let e,i,s;for(e=0,i=t.length;e<i;++e)s=t[e],s.label=this._tickFormatFunction(s.value,e,t)}getDecimalForValue(t){return null===t?NaN:(t-this.min)/(this.max-this.min)}getPixelForValue(t){const e=this._offsets,i=this.getDecimalForValue(t);return this.getPixelForDecimal((e.start+i)*e.factor)}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return this.min+i*(this.max-this.min)}_getLabelSize(t){const e=this.options.ticks,i=this.ctx.measureText(t).width,s=_i(this.isHorizontal()?e.maxRotation:e.minRotation),o=Math.cos(s),n=Math.sin(s),a=this._resolveTickFontOptions(0).size;return{w:i*o+a*n,h:i*n+a*o}}_getLabelCapacity(t){const e=this.options.time,i=e.displayFormats,s=i[e.unit]||i.millisecond,o=this._tickFormatFunction(t,0,zl(this,[t],this._majorUnit),s),n=this._getLabelSize(o),a=Math.floor(this.isHorizontal()?this.width/n.w:this.height/n.h)-1;return a>0?a:1}getDataTimestamps(){let t,e,i=this._cache.data||[];if(i.length)return i;const s=this.getMatchingVisibleMetas();if(this._normalized&&s.length)return this._cache.data=s[0].controller.getAllParsedValues(this);for(t=0,e=s.length;t<e;++t)i=i.concat(s[t].controller.getAllParsedValues(this));return this._cache.data=this.normalize(i)}getLabelTimestamps(){const t=this._cache.labels||[];let e,i;if(t.length)return t;const s=this.getLabels();for(e=0,i=s.length;e<i;++e)t.push(Tl(this,s[e]));return this._cache.labels=this._normalized?t:this.normalize(t)}normalize(t){return Ri(t.sort(Ol))}}function Fl(t,e,i){let s,o,n,a,r=0,l=t.length-1;i?(e>=t[r].pos&&e<=t[l].pos&&({lo:r,hi:l}=Di(t,"pos",e)),({pos:s,time:n}=t[r]),({pos:o,time:a}=t[l])):(e>=t[r].time&&e<=t[l].time&&({lo:r,hi:l}=Di(t,"time",e)),({time:s,pos:n}=t[r]),({time:o,pos:a}=t[l]));const h=o-s;return h?n+(a-n)*(e-s)/h:n}s(Il,"id","time"),s(Il,"defaults",{bounds:"data",adapters:{},time:{parser:!1,unit:!1,round:!1,isoWeekday:!1,minUnit:"millisecond",displayFormats:{}},ticks:{source:"auto",callback:!1,major:{enabled:!1}}});class Vl extends Il{constructor(t){super(t),this._table=[],this._minPos=void 0,this._tableRange=void 0}initOffsets(){const t=this._getTimestampsForTable(),e=this._table=this.buildLookupTable(t);this._minPos=Fl(e,this.min),this._tableRange=Fl(e,this.max)-this._minPos,super.initOffsets(t)}buildLookupTable(t){const{min:e,max:i}=this,s=[],o=[];let n,a,r,l,h;for(n=0,a=t.length;n<a;++n)l=t[n],l>=e&&l<=i&&s.push(l);if(s.length<2)return[{time:e,pos:0},{time:i,pos:1}];for(n=0,a=s.length;n<a;++n)h=s[n+1],r=s[n-1],l=s[n],Math.round((h+r)/2)!==l&&o.push({time:l,pos:n/(a-1)});return o}_generate(){const t=this.min,e=this.max;let i=super.getDataTimestamps();return i.includes(t)&&i.length||i.splice(0,0,t),i.includes(e)&&1!==i.length||i.push(e),i.sort((t,e)=>t-e)}_getTimestampsForTable(){let t=this._cache.all||[];if(t.length)return t;const e=this.getDataTimestamps(),i=this.getLabelTimestamps();return t=e.length&&i.length?this.normalize(e.concat(i)):e.length?e:i,t=this._cache.all=t,t}getDecimalForValue(t){return(Fl(this._table,t)-this._minPos)/this._tableRange}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return Fl(this._table,i*this._tableRange+this._minPos,!0)}}s(Vl,"id","timeseries"),s(Vl,"defaults",Il.defaults);const Hl=[hn,lr,al,Object.freeze({__proto__:null,CategoryScale:hl,LinearScale:pl,LogarithmicScale:vl,RadialLinearScale:El,TimeScale:Il,TimeSeriesScale:Vl})];var Nl=Object.defineProperty,Bl=Object.getOwnPropertyDescriptor,Wl=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?Bl(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&Nl(e,i,n),n};let jl=class extends ht{constructor(){super(...arguments),this.priceDecimals=2,this.currency="€",this._open=!1,this._action="",this._socLimit=100,this._socLimitType="auto",this._fullHour=!0,this._minutes=30,this._evCharging=!1}open(t,e){this._date=t,this._hour=e,this._open=!0,this._loadFormValues()}close(){this._open=!1,this._date=void 0,this._hour=void 0}_resolveAction(t){var e,i,s,o;const n=(null==(e=this.data)?void 0:e.default_mode)??"",a=(null==(i=this.integrationConfig)?void 0:i.mode_self_consume)??"",r=(null==(s=this.integrationConfig)?void 0:s.mode_grid_only)??"";return"PV_CHARGE"===t||"SELF_CONSUME_FIRST"===t?n:"SELF_CONSUME_ONLY"===t?a||n:"PAID_IMPORT"===t?r||n:"CHARGE"===t?(null==(o=this.integrationConfig)?void 0:o.mode_charge_battery)??n:t}_loadFormValues(){var t,e,i;if(!this._date||void 0===this._hour)return;const s=null==(i=null==(e=null==(t=this.data)?void 0:t.schedule)?void 0:e[this._date])?void 0:i[this._hour.toString()];s?(this._action=this._resolveAction(s.action??""),this._socLimit=s.soc_limit??100,this._socLimitType=s.soc_limit_type??"auto",this._fullHour=s.full_hour??!0,this._minutes=s.minutes??30,this._evCharging=s.ev_charging??!1):(this._action="",this._socLimit=100,this._socLimitType="auto",this._fullHour=!0,this._minutes=30,this._evCharging=!1)}_getHourData(){var t,e;if(!this._date||void 0===this._hour||!this.data)return;const i=null==(t=this.data.buy_prices)?void 0:t.find(t=>t.date===this._date&&t.hour===this._hour),s=null==(e=this.data.sell_prices)?void 0:e.find(t=>t.date===this._date&&t.hour===this._hour);return{date:this._date,hour:this._hour,buyPrice:null==i?void 0:i.value,sellPrice:null==s?void 0:s.value}}_getScheduleEntry(){var t,e,i;if(this._date&&void 0!==this._hour)return null==(i=null==(e=null==(t=this.data)?void 0:t.schedule)?void 0:e[this._date])?void 0:i[this._hour.toString()]}_isNonDefault(){var t;return!!this._action&&this._action!==(null==(t=this.data)?void 0:t.default_mode)}_hasEvStopCondition(){var t;const e=null==(t=this.integrationConfig)?void 0:t.ev_stop_condition;return!!e&&((Array.isArray(e)||"string"==typeof e)&&e.length>0)}_supportsSocLimit(){if(!this._action)return!1;const t=this.integrationConfig;return[null==t?void 0:t.mode_charge_battery,null==t?void 0:t.mode_charge_ev,null==t?void 0:t.mode_charge_ev_and_battery,null==t?void 0:t.mode_sell].includes(this._action)}async _handleSave(){var t,e;if(!this.hass||!this._date||void 0===this._hour||!this._action)return;const i=(null==(t=this.data)?void 0:t.default_mode)??"",s={};this._action!==i&&(this._hasEvStopCondition()&&(s.ev_charging=this._evCharging),!this._evCharging&&(null==(e=this.integrationConfig)?void 0:e.soc_sensor)&&this._supportsSocLimit()&&(s.soc_limit=this._socLimit,s.soc_limit_type=this._socLimitType),s.full_hour=this._fullHour,this._fullHour||(s.minutes=this._minutes)),await async function(t,e,i,s,o){await t.callApi("POST",`${jt}/schedule`,{date:e,hour:i,action:s,...o})}(this.hass,this._date,this._hour,this._action,s),this._dispatchRefresh(),this.close()}async _handleClear(){this.hass&&this._date&&void 0!==this._hour&&(await async function(t,e,i){let s=`${jt}/schedule?date=${e}`;void 0!==i&&(s+=`&hour=${i}`),await t.callApi("DELETE",s)}(this.hass,this._date,this._hour),this._dispatchRefresh(),this.close())}async _handleUnlock(){this.hass&&this._date&&void 0!==this._hour&&(await async function(t,e,i,s){await t.callApi("POST",`${jt}/manual`,{date:e,hour:i,manual:s})}(this.hass,this._date,this._hour,!1),this._dispatchRefresh(),this.close())}_dispatchRefresh(){this.dispatchEvent(new CustomEvent("data-refresh-needed",{bubbles:!0,composed:!0}))}render(){var t,e,i,s,o;if(!this._open||!this._date||void 0===this._hour)return X;const n=this._getHourData(),a=this._getScheduleEntry(),r=!!a,l=!0===(null==a?void 0:a.manual),h=(null==(t=this.data)?void 0:t.inverter_modes)??[],c=(null==(e=this.data)?void 0:e.default_mode)??"",d=!!(null==(i=this.integrationConfig)?void 0:i.soc_sensor)&&!this._evCharging&&this._supportsSocLimit(),u=this._hasEvStopCondition(),p=this._isNonDefault();return U`
      <div class="modal-overlay open"
        @click=${t=>{t.target.classList.contains("modal-overlay")&&this.close()}}>
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${Ft(this._date,this._hour)}</h3>
            <button class="modal-close" @click=${this.close}>&times;</button>
          </div>

          <div class="price-info">
            <div class="row">
              <span>Buy:</span>
              <span>${Ht(null==n?void 0:n.buyPrice,this.priceDecimals,this.currency)}</span>
            </div>
            <div class="row">
              <span>Sell:</span>
              <span>${Ht(null==n?void 0:n.sellPrice,this.priceDecimals,this.currency)}</span>
            </div>
            ${(null==(s=this.integrationConfig)?void 0:s.inverter_export_surplus_switch)&&void 0!==(null==a?void 0:a.export_surplus)?U`
              <div class="row">
                <span>Export:</span>
                <span>${a.export_surplus?"ON":"OFF"}</span>
              </div>
            `:X}
            ${(null==(o=this.integrationConfig)?void 0:o.inverter_pv_input_switch)&&void 0!==(null==a?void 0:a.pv_input)?U`
              <div class="row">
                <span>PV Input:</span>
                <span>${a.pv_input?"ON":"OFF"}</span>
              </div>
            `:X}
          </div>

          <div class="form-group">
            <label>Inverter Mode</label>
            <select .value=${this._action}
              @change=${t=>{this._action=t.target.value}}>
              <option value="">-- Select --</option>
              ${h.map(t=>U`
                <option value=${t} ?selected=${t===this._action}>
                  ${t}${t===c?" *":""}
                </option>
              `)}
            </select>
          </div>

          ${p?U`
            ${u?U`
              <div class="toggle-row">
                <span class="toggle-label">EV Charging</span>
                <label class="toggle-switch">
                  <input type="checkbox" .checked=${this._evCharging}
                    @change=${t=>{this._evCharging=t.target.checked}} />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            `:X}

            ${d?U`
              <div class="form-divider"></div>
              <div class="form-group">
                <label>SOC Limit Type</label>
                <select .value=${this._socLimitType}
                  @change=${t=>{this._socLimitType=t.target.value}}>
                  <option value="auto">Auto</option>
                  <option value="max">Max (charge to)</option>
                  <option value="min">Min (discharge to)</option>
                </select>
              </div>
              <div class="range-group">
                <div class="range-header">
                  <span class="range-label">SOC Limit</span>
                  <span class="range-value">${this._socLimit}%</span>
                </div>
                <input type="range" class="range-input" min="5" max="100" step="5"
                  .value=${String(this._socLimit)}
                  @input=${t=>{this._socLimit=parseInt(t.target.value)}} />
              </div>
            `:X}

            <div class="form-divider"></div>
            <div class="toggle-row">
              <span class="toggle-label">Full Hour</span>
              <label class="toggle-switch">
                <input type="checkbox" .checked=${this._fullHour}
                  @change=${t=>{this._fullHour=t.target.checked}} />
                <span class="toggle-slider"></span>
              </label>
            </div>
            ${this._fullHour?X:U`
              <div class="range-group">
                <div class="range-header">
                  <span class="range-label">Minutes</span>
                  <span class="range-value">${this._minutes} min</span>
                </div>
                <input type="range" class="range-input" min="5" max="55" step="5"
                  .value=${String(this._minutes)}
                  @input=${t=>{this._minutes=parseInt(t.target.value)}} />
              </div>
            `}
          `:X}

          <div class="modal-actions">
            ${r?U`<button class="btn btn-danger" @click=${this._handleClear}>
              <ha-icon icon="mdi:delete-outline"></ha-icon> Clear
            </button>`:X}
            ${l?U`<button class="btn btn-warning" @click=${this._handleUnlock}>
              <ha-icon icon="mdi:lock-open-outline"></ha-icon> Unlock
            </button>`:X}
            <button class="btn btn-primary" @click=${this._handleSave} ?disabled=${!this._action}>
              <ha-icon icon="mdi:check"></ha-icon> Save
            </button>
          </div>
        </div>
      </div>
    `}};jl.styles=wt,Wl([gt({attribute:!1})],jl.prototype,"hass",2),Wl([gt({attribute:!1})],jl.prototype,"data",2),Wl([gt({attribute:!1})],jl.prototype,"integrationConfig",2),Wl([gt({type:Number})],jl.prototype,"priceDecimals",2),Wl([gt({type:String})],jl.prototype,"currency",2),Wl([ft()],jl.prototype,"_open",2),Wl([ft()],jl.prototype,"_date",2),Wl([ft()],jl.prototype,"_hour",2),Wl([ft()],jl.prototype,"_action",2),Wl([ft()],jl.prototype,"_socLimit",2),Wl([ft()],jl.prototype,"_socLimitType",2),Wl([ft()],jl.prototype,"_fullHour",2),Wl([ft()],jl.prototype,"_minutes",2),Wl([ft()],jl.prototype,"_evCharging",2),jl=Wl([dt("es-hour-modal")],jl);var Ul=Object.defineProperty,Yl=Object.getOwnPropertyDescriptor,Xl=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?Yl(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&Ul(e,i,n),n};Ia.register(...Hl);let ql=class extends ht{constructor(){super(...arguments),this.currency="€",this._optimizing=!1,this._clearing=!1,this._chartHoursData=[]}connectedCallback(){var t;super.connectedCallback(),this.data&&!1!==(null==(t=this.cardConfig)?void 0:t.show_chart)&&this.updateComplete.then(()=>this._setupChart())}disconnectedCallback(){super.disconnectedCallback(),this._destroyChart()}updated(t){var e;super.updated(t),t.has("data")&&this.data&&(this._chartInstance?this._updateChart():!1!==(null==(e=this.cardConfig)?void 0:e.show_chart)&&this.updateComplete.then(()=>this._setupChart()))}_setupChart(){var t;const e=null==(t=this.shadowRoot)?void 0:t.getElementById("priceChart");if(!e)return;this._chartInstance&&(this._chartInstance.destroy(),this._chartInstance=void 0);const i=e.getContext("2d");if(!i)return;const s=getComputedStyle(this).getPropertyValue("--primary-text-color")||"#333",o=getComputedStyle(this).getPropertyValue("--divider-color")||"#e0e0e0",n=getComputedStyle(this).getPropertyValue("--secondary-background-color")||"#f5f5f5",a=i.createLinearGradient(0,0,0,e.height||250);a.addColorStop(0,"rgba(33, 150, 243, 0.3)"),a.addColorStop(1,"rgba(33, 150, 243, 0)");const r=i.createLinearGradient(0,0,0,e.height||250);r.addColorStop(0,"rgba(76, 175, 80, 0.3)"),r.addColorStop(1,"rgba(76, 175, 80, 0)"),this._chartInstance=new Ia(i,{type:"line",data:{labels:[],datasets:[{label:"Buy",data:[],borderColor:"#2196F3",backgroundColor:a,borderWidth:2.5,pointRadius:0,pointHoverRadius:6,pointHoverBackgroundColor:"#2196F3",pointHoverBorderColor:"#fff",pointHoverBorderWidth:2,tension:.4,fill:!0,order:2},{label:"Sell",data:[],borderColor:"#4CAF50",backgroundColor:r,borderWidth:2.5,pointRadius:0,pointHoverRadius:6,pointHoverBackgroundColor:"#4CAF50",pointHoverBorderColor:"#fff",pointHoverBorderWidth:2,tension:.4,fill:!0,order:3},{label:"PV Forecast",data:[],borderColor:"#FF9800",backgroundColor:"rgba(255, 152, 0, 0.12)",borderWidth:2,borderDash:[6,4],pointRadius:0,pointHoverRadius:5,pointHoverBackgroundColor:"#FF9800",pointHoverBorderColor:"#fff",pointHoverBorderWidth:2,tension:.35,fill:!1,order:4,yAxisID:"yPv"},{label:"Schedule",data:[],type:"bar",backgroundColor:[],borderWidth:0,barPercentage:1,categoryPercentage:1,order:1,yAxisID:"ySchedule"}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!0,position:"top",align:"end",labels:{color:s,usePointStyle:!0,pointStyle:"circle",font:{size:11},padding:12,boxWidth:8,boxHeight:8,filter:t=>"Schedule"!==t.text}},tooltip:{enabled:!0,backgroundColor:n,titleColor:s,bodyColor:s,borderColor:o,borderWidth:1,cornerRadius:8,padding:12,usePointStyle:!0,titleFont:{size:12,weight:"bold"},bodyFont:{size:11},filter:t=>t.datasetIndex<3,callbacks:{title:t=>{var e,i;const s=null==(e=t[0])?void 0:e.dataIndex;if(void 0===s)return"";const o=this._chartHoursData[s];return o?Ft(o.date,o.hour):(null==(i=t[0])?void 0:i.label)??""},label:t=>{const e=t.parsed.y??0,i="PV Forecast"===t.dataset.label?" kWh":"";return` ${t.dataset.label}: ${e.toFixed(4)}${i}`}}}},scales:{x:{display:!0,grid:{color:o,drawTicks:!1},border:{display:!1},ticks:{color:s,maxRotation:0,font:{size:9},padding:8,maxTicksLimit:12}},y:{display:!0,grid:{color:o,drawTicks:!1},border:{display:!1},ticks:{color:s,callback:t=>Number(t).toFixed(2),font:{size:10},padding:8}},yPv:{display:!0,position:"right",grid:{display:!1},border:{display:!1},ticks:{color:"#FF9800",callback:t=>`${Number(t).toFixed(1)} kWh`,font:{size:10},padding:8}},ySchedule:{display:!1,min:0,max:1}},onClick:(t,e)=>{if(e.length>0){const t=this._chartHoursData[e[0].index];t&&this._openModal(t.date,t.hour)}}}}),this._updateChart(),e.parentElement&&(this._resizeObserver=new ResizeObserver(()=>{this._chartInstance&&null!==e.offsetParent&&this._chartInstance.resize()}),this._resizeObserver.observe(e.parentElement))}_updateChart(){var t,e;if(!this.data||!this._chartInstance)return;const i=null==(e=null==(t=this.hass)?void 0:t.config)?void 0:e.time_zone,s=Nt(this.data.buy_prices??[],this.data.sell_prices??[],i);this._chartHoursData=s;const o=this.data.schedule??{},n=new Map((this.data.pv_forecast??[]).map(t=>[`${t.date}-${t.hour}`,t.kwh??0])),a=Lt(i),r=Rt(i),l=s.map(t=>t.date===a?It(t.hour):t.date===r?"T+"+It(t.hour):t.date.substring(5)+" "+It(t.hour)),h=this._chartInstance;h.data.labels=l,h.data.datasets[0].data=s.map(t=>t.buyPrice??null),h.data.datasets[1].data=s.map(t=>t.sellPrice??null),h.data.datasets[2].data=s.map(t=>n.get(`${t.date}-${t.hour}`)??0);const c=s.map(t=>{var e;const i=null==(e=o[t.date])?void 0:e[t.hour.toString()];if(!i)return"transparent";return Pt(Ct(i,this.integrationConfig))});h.data.datasets[3].data=s.map(t=>{var e;return(null==(e=o[t.date])?void 0:e[t.hour.toString()])?1:0}),h.data.datasets[3].backgroundColor=c,h.update("none")}_destroyChart(){this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=void 0),this._chartInstance&&(this._chartInstance.destroy(),this._chartInstance=void 0)}_dispatchRefresh(){this.dispatchEvent(new CustomEvent("data-refresh-needed",{bubbles:!0,composed:!0}))}_dispatchStatePatch(t){this.dispatchEvent(new CustomEvent("card-state-patch",{bubbles:!0,composed:!0,detail:t}))}async _handleOptimize(){if(this.hass&&!this._optimizing){this._optimizing=!0;try{await async function(t,e=36){await t.callService(jt,"run_optimization",{hours_ahead:e})}(this.hass)}finally{this._optimizing=!1}this._dispatchRefresh()}}async _handleClearAll(){if(this.hass&&!this._clearing&&confirm("Clear all scheduled tasks?")){this._clearing=!0;try{await async function(t){var e;const i=null==(e=t.config)?void 0:e.time_zone;await t.callService(jt,"clear_schedule",{date:Lt(i)}),await t.callService(jt,"clear_schedule",{date:Rt(i)})}(this.hass)}finally{this._clearing=!1}this._dispatchRefresh()}}async _handlePauseToggle(){var t;if(!this.hass)return;const e=(null==(t=this.data)?void 0:t.paused)??!1;await async function(t,e){await t.callApi("POST",`${jt}/pause`,{paused:e})}(this.hass,!e),this._dispatchStatePatch({data:{paused:!e}}),this._dispatchRefresh()}async _handleIntervalChange(t){if(!this.hass)return;const e=t.target.value;await async function(t,e){await t.callApi("POST",`${jt}/optimize_interval`,{interval:e})}(this.hass,e),this._dispatchStatePatch({integrationConfig:{optimize_interval:e}}),this._dispatchRefresh()}async _handleInverterChange(t){if(!this.hass)return;const e=t.target.value;e&&(await async function(t,e){await t.callApi("POST",`${jt}/apply_mode`,{mode:e})}(this.hass,e),this._dispatchRefresh())}_openModal(t,e){var i;const s=null==(i=this.shadowRoot)?void 0:i.querySelector("es-hour-modal");null==s||s.open(t,e)}render(){var t,e,i,s,o,n,a,r,l;const h=null==(e=null==(t=this.hass)?void 0:t.config)?void 0:e.time_zone,c=!1!==(null==(i=this.cardConfig)?void 0:i.show_chart),d=this.data?Nt(this.data.buy_prices??[],this.data.sell_prices??[],h):[],u=(null==(s=this.data)?void 0:s.schedule)??{},{date:p,hour:g}=zt(h),f=(null==(o=this.cardConfig)?void 0:o.price_decimals)??2;let m=null;const b="manual"===((null==(n=this.integrationConfig)?void 0:n.optimize_interval)??"auto")?"manual":"auto",x=(null==(a=this.data)?void 0:a.paused)??!1,v=(null==(r=this.data)?void 0:r.inverter_modes)??[];return U`
      <div class="schedule-tab">
        ${c?U`
              <div class="chart-section">
                <div class="chart-container"
                  style="--chart-height: ${(null==(l=this.cardConfig)?void 0:l.chart_height)??250}px">
                  <canvas id="priceChart"></canvas>
                </div>
              </div>
            `:X}

        <div class="controls-bar">
          <button class="btn btn-primary" @click=${this._handleOptimize} ?disabled=${this._optimizing}>
            <ha-icon icon="mdi:play"></ha-icon> ${this._optimizing?"Running...":"Optimize"}
          </button>
          <button class="btn btn-secondary" @click=${this._handleClearAll} ?disabled=${this._clearing}>
            <ha-icon icon="mdi:delete-outline"></ha-icon> ${this._clearing?"Clearing...":"Clear"}
          </button>
          <div class="controls-spacer"></div>
          <button class="status-chip ${x?"paused":"active"}" @click=${this._handlePauseToggle}>
            <ha-icon icon=${x?"mdi:pause-circle-outline":"mdi:check-circle-outline"}></ha-icon>
            ${x?"Paused":"Active"}
          </button>
        </div>
        <div class="controls-bar">
          <select class="controls-select" .value=${b} @change=${this._handleIntervalChange}>
            <option value="auto" ?selected=${"auto"===b}>Auto</option>
            <option value="manual" ?selected=${"manual"===b}>Manual</option>
          </select>
          ${v.length>0?U`
            <select class="controls-select" @change=${this._handleInverterChange}>
              <option value="">Inverter mode</option>
              ${v.map(t=>U`<option value=${t}>${t}</option>`)}
            </select>
          `:X}
        </div>

        <div class="schedule-grid">
          ${0===d.length?U`<div class="empty-state">No price data available</div>`:d.map(t=>{var e,i,s;let o=X;t.date!==m&&(m=t.date,o=U`<div class="day-separator">${Vt(t.date,h)}</div>`);const n=null==(e=u[t.date])?void 0:e[t.hour.toString()],a=!!n,r=!0===(null==n?void 0:n.manual),l=t.date===p&&t.hour===g,c=n?Ct(n,this.integrationConfig):void 0,d=c?Mt[c]:"";const b=c?Pt(c):"",x=c?function(t){return At[t]}(c):"",v=c?function(t){return Et[t]}(c):"";return U`
                  ${o}
                  <div
                    class="hour-slot ${l?"current":""}"
                    style="${a?`border-color: ${d}; background: ${b}`:""}"
                    @click=${()=>this._openModal(t.date,t.hour)}
                  >
                    ${x?U`<ha-icon .icon=${x} style="--mdc-icon-size: 16px; color: ${d};"></ha-icon>`:X}
                    <div class="hour-badges">
                      ${r?U`<span class="lock-badge">&#x1f512;</span>`:X}
                      ${!1===(null==n?void 0:n.export_surplus)&&(null==(i=this.integrationConfig)?void 0:i.inverter_export_surplus_switch)?U`<ha-icon
                            class="no-export-badge"
                            icon="mdi:transmission-tower-off"
                            title="Grid export disabled (low sell price)"
                          ></ha-icon>`:X}
                      ${!1===(null==n?void 0:n.pv_input)&&(null==(s=this.integrationConfig)?void 0:s.inverter_pv_input_switch)?U`<ha-icon
                            class="no-pv-badge"
                            icon="mdi:weather-sunny-off"
                            title="PV input disabled (paid import / negative-price charge)"
                          ></ha-icon>`:X}
                    </div>
                    <div class="time">${It(t.hour)}</div>
                    <div class="prices">
                      ${void 0!==t.buyPrice?U`<span class="buy">${t.buyPrice.toFixed(f)}</span>`:X}
                      ${void 0!==t.sellPrice?U`<span class="sell">${t.sellPrice.toFixed(f)}</span>`:X}
                    </div>
                    ${a?U`<div class="action-label" style="color: ${d}">
                          ${v}
                        </div>
                        ${null!=(null==n?void 0:n.soc_limit)?U`<div class="soc-label" style="color: ${d}; opacity: 0.7; font-size: 0.65em;">
                              SOC ${n.soc_limit}%
                            </div>`:X}`:X}
                  </div>
                `})}
        </div>

        <es-hour-modal
          .hass=${this.hass}
          .data=${this.data}
          .integrationConfig=${this.integrationConfig}
          .priceDecimals=${f}
          .currency=${this.currency}
        ></es-hour-modal>
      </div>
    `}};ql.styles=[mt,vt],Xl([gt({attribute:!1})],ql.prototype,"hass",2),Xl([gt({attribute:!1})],ql.prototype,"data",2),Xl([gt({attribute:!1})],ql.prototype,"integrationConfig",2),Xl([gt({attribute:!1})],ql.prototype,"cardConfig",2),Xl([gt({type:String})],ql.prototype,"currency",2),Xl([ft()],ql.prototype,"_optimizing",2),Xl([ft()],ql.prototype,"_clearing",2),ql=Xl([dt("es-schedule-tab")],ql);var Gl=Object.defineProperty,Kl=Object.getOwnPropertyDescriptor,Jl=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?Kl(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&Gl(e,i,n),n};let Zl=class extends ht{_dispatchRefresh(){this.dispatchEvent(new CustomEvent("data-refresh-needed",{bubbles:!0,composed:!0}))}async _handleEvChargeNow(){this.hass&&(await async function(t){await t.callService(jt,"ev_charge_now",{})}(this.hass),this._dispatchRefresh())}async _handleEvChargeStop(){this.hass&&(await async function(t){await t.callService(jt,"ev_charge_stop",{})}(this.hass),this._dispatchRefresh())}_getEntityState(t){var e;if(t&&this.hass)return null==(e=this.hass.states[t])?void 0:e.state}_getEvSchedule(){var t,e;const i=(null==(t=this.data)?void 0:t.schedule)??{},s=(null==(e=this.integrationConfig)?void 0:e.ev_max_charge_amps)??16,o=[];for(const[n,a]of Object.entries(i))for(const[t,e]of Object.entries(a)){const i=e;i.ev_charging&&o.push({date:n,hour:parseInt(t),reason:i.ev_charge_reason??"scheduled",amps:s})}return o.sort((t,e)=>t.date!==e.date?t.date.localeCompare(e.date):t.hour-e.hour),o}render(){var t,e,i,s,o,n,a,r,l;const h=this._getEntityState(null==(t=this.integrationConfig)?void 0:t.ev_connected_sensor),c=this._getEntityState(null==(e=this.integrationConfig)?void 0:e.ev_soc_sensor),d="on"===h||"true"===h,u=(null==(i=this.integrationConfig)?void 0:i.ev_max_charge_amps)??16,p=(null==(s=this.integrationConfig)?void 0:s.ev_voltage)??230,g=this._getEvSchedule(),f=null==(n=null==(o=this.hass)?void 0:o.config)?void 0:n.time_zone,{date:m,hour:b}=zt(f),x=null==(l=null==(r=null==(a=this.data)?void 0:a.schedule)?void 0:r[m])?void 0:l[b.toString()],v=(null==x?void 0:x.ev_charging)??!1,_=(null==x?void 0:x.ev_charge_reason)??"none";return U`
      <div class="ev-tab">
        <div class="ev-control-bar">
          <button class="btn btn-primary" @click=${this._handleEvChargeNow}>
            <ha-icon icon="mdi:lightning-bolt"></ha-icon> Charge Now
          </button>
          <button class="btn btn-secondary" @click=${this._handleEvChargeStop}>
            <ha-icon icon="mdi:stop"></ha-icon> Stop
          </button>
        </div>

        <div class="ev-status">
          <h3>EV Status</h3>
          <div class="status-grid">
            <div class="status-field">
              <span class="field-label">Connection</span>
              <span class="field-value ${d?"connected":"disconnected"}">
                ${d?"Connected":"Disconnected"}
              </span>
            </div>
            <div class="status-field">
              <span class="field-label">SOC</span>
              <span class="field-value">${c??"--"}%</span>
            </div>
            <div class="status-field">
              <span class="field-label">Charging</span>
              <span class="field-value ${v?"charging":""}">
                ${v?"Yes":"No"}
              </span>
            </div>
            <div class="status-field">
              <span class="field-label">Reason</span>
              <span class="field-value">${_}</span>
            </div>
          </div>
        </div>

        ${v?U`
          <div class="session-block">
            <h3>Current Session</h3>
            <div class="status-grid">
              <div class="status-field">
                <span class="field-label">Mode</span>
                <span class="field-value">${(null==x?void 0:x.manual)?"Manual":"Scheduled"}</span>
              </div>
              <div class="status-field">
                <span class="field-label">Current</span>
                <span class="field-value">${u}A</span>
              </div>
              <div class="status-field">
                <span class="field-label">Power</span>
                <span class="field-value">${(u*p/1e3).toFixed(1)} kW</span>
              </div>
              <div class="status-field">
                <span class="field-label">Reason</span>
                <span class="field-value">${_}</span>
              </div>
            </div>
          </div>
        `:X}

        <div class="ev-schedule-list">
          <h3>Charge Schedule</h3>
          ${0===g.length?U`<div class="empty-ev">No EV charging scheduled</div>`:g.map(t=>U`
              <div class="ev-hour-item">
                <span class="ev-hour-time">${Vt(t.date,f)} ${It(t.hour)}</span>
                <span class="ev-hour-reason">${t.reason}</span>
                <span class="ev-hour-amps">${t.amps}A</span>
              </div>
            `)}
        </div>
      </div>
    `}};Zl.styles=[mt,_t],Jl([gt({attribute:!1})],Zl.prototype,"hass",2),Jl([gt({attribute:!1})],Zl.prototype,"data",2),Jl([gt({attribute:!1})],Zl.prototype,"integrationConfig",2),Zl=Jl([dt("es-ev-tab")],Zl);var Ql=Object.defineProperty,th=Object.getOwnPropertyDescriptor,eh=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?th(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&Ql(e,i,n),n};let ih=class extends ht{constructor(){super(...arguments),this.priceDecimals=2,this.currency="€",this._selectedWeekday=-1,this._profileLoading=!1}connectedCallback(){var t,e;super.connectedCallback(),this._selectedWeekday<0&&(this._selectedWeekday=Dt(null==(e=null==(t=this.hass)?void 0:t.config)?void 0:e.time_zone).weekday),this._loadConsumptionProfile()}disconnectedCallback(){super.disconnectedCallback(),this._consumptionChart&&(this._consumptionChart.destroy(),this._consumptionChart=void 0)}async _loadConsumptionProfile(){if(this.hass&&!this._profileLoading){this._profileLoading=!0;try{this._consumptionProfile=await async function(t){return t.callApi("GET",`${jt}/consumption_profile`)}(this.hass),await this.updateComplete,this._setupConsumptionChart()}catch{}finally{this._profileLoading=!1}}}_setupConsumptionChart(){var t,e,i,s;const o=null==(t=this.shadowRoot)?void 0:t.getElementById("consumptionChart");if(!o||!(null==(e=this._consumptionProfile)?void 0:e.has_profile))return;this._consumptionChart&&this._consumptionChart.destroy();const n=o.getContext("2d");if(!n)return;const a=(r=this._selectedWeekday,Bt[r]??"");var r;const l=(null==(i=this._consumptionProfile.profile)?void 0:i[a])??{},h=(null==(s=this._consumptionProfile.ev_profile)?void 0:s[a])??{},c=this._consumptionProfile.has_ev_sensor&&Object.keys(h).length>0,d=Array.from({length:24},(t,e)=>It(e)),u=Array.from({length:24},(t,e)=>l[e.toString()]??0),p=Array.from({length:24},(t,e)=>h[e.toString()]??0),g=getComputedStyle(this).getPropertyValue("--primary-text-color")||"#333",f=getComputedStyle(this).getPropertyValue("--divider-color")||"#e0e0e0",m=[{label:c?"Home":"Consumption",data:u,backgroundColor:"rgba(33, 150, 243, 0.4)",borderColor:"#2196F3",borderWidth:1,borderRadius:c?0:2,stack:"consumption"}];c&&m.push({label:"EV",data:p,backgroundColor:"rgba(76, 175, 80, 0.4)",borderColor:"#4CAF50",borderWidth:1,borderRadius:2,stack:"consumption"}),this._consumptionChart=new Ia(n,{type:"bar",data:{labels:d,datasets:m},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:c,position:"top",labels:{boxWidth:12,font:{size:10},color:g}},tooltip:{callbacks:{label:t=>`${t.dataset.label}: ${t.parsed.y.toFixed(2)} kWh`}}},scales:{x:{stacked:!0,grid:{display:!1},ticks:{color:g,font:{size:8},maxTicksLimit:12}},y:{stacked:!0,grid:{color:f},ticks:{color:g,font:{size:9},callback:t=>`${Number(t).toFixed(1)}`}}}}})}_handleWeekdayChange(t){this._selectedWeekday=parseInt(t.target.value),this._setupConsumptionChart()}_isFutureHour(t,e){var i,s;const{date:o,hour:n}=zt(null==(s=null==(i=this.hass)?void 0:i.config)?void 0:s.time_zone);return t>o||!(t<o)&&e>=n}_getChargeHours(){var t,e,i,s;const o=(null==(t=this.data)?void 0:t.schedule)??{},n=[],a=(null==(e=this.data)?void 0:e.buy_prices)??[];for(const[r,l]of Object.entries(o))for(const[t,e]of Object.entries(l)){const o=parseInt(t);if(!this._isFutureHour(r,o))continue;const l=e;if("CHARGE"===l.action||l.action===(null==(i=this.integrationConfig)?void 0:i.mode_charge_battery)){const t=(null==(s=a.find(t=>t.date===r&&t.hour===o))?void 0:s.value)??0;n.push({date:r,hour:o,price:t})}}return n.sort((t,e)=>t.price-e.price),n.map(t=>({hour:`${t.date.substring(5)} ${It(t.hour)}`,price:t.price}))}_getDischargeHours(){var t,e,i,s;const o=(null==(t=this.data)?void 0:t.schedule)??{},n=[],a=(null==(e=this.data)?void 0:e.sell_prices)??[],r=null==(i=this.integrationConfig)?void 0:i.mode_sell;for(const[l,h]of Object.entries(o))for(const[t,e]of Object.entries(h)){const i=parseInt(t);if(this._isFutureHour(l,i)&&e.action===r){const t=(null==(s=a.find(t=>t.date===l&&t.hour===i))?void 0:s.value)??0;n.push({date:l,hour:i,price:t})}}return n.sort((t,e)=>e.price-t.price),n.map(t=>({hour:`${t.date.substring(5)} ${It(t.hour)}`,price:t.price}))}render(){var t;const e=null==(t=this.data)?void 0:t.last_optimization,i=this._getChargeHours(),s=this._getDischargeHours(),o=this._consumptionProfile;return U`
      <div class="stats-tab">
        ${this._renderArbitrage(e,i,s)}
        ${this._renderPvConfidence()}
        ${this._renderConsumption(o)}
        ${this._renderLastOptimization(e)}
      </div>
    `}_renderPvConfidence(){var t;const e=null==(t=this.data)?void 0:t.pv_dynamic;if(!e)return null;const i=Math.round(100*e.factor),s=(()=>{if(e.active)return"clamped"===e.reason?"Active (clamped)":"Active";switch(e.reason){case"disabled":return"Disabled in settings";case"no_sensor":return"No PV production sensor configured";case"sensor_missing":return"PV sensor not found";case"sensor_unavailable":return"PV sensor unavailable";case"sensor_invalid":return"PV sensor returned invalid value";case"sensor_negative":return"PV sensor returned negative value";case"below_threshold":return"Waiting for ≥ 2 kWh of elapsed forecast";case"not_computed":return"Not yet computed";default:return e.reason||"Inactive"}})();let o="var(--success-color, #43a047)";e.active?i<50?o="var(--error-color, #e53935)":i<80&&(o="var(--warning-color, #fb8c00)"):o="var(--secondary-text-color)";const n=e.solcast_confidence;return U`
      <div class="stats-block">
        <h3>PV Confidence</h3>
        <div class="profit-value" style="color: ${o}">
          ${e.active?`${i}%`:"—"}
        </div>
        <div class="stats-row">
          <span class="label">Status</span>
          <span class="value">${s}</span>
        </div>
        ${null!==e.actual_today_kwh&&null!==e.baseline_elapsed_kwh?U`
          <div class="stats-row">
            <span class="label">Actual today / baseline elapsed</span>
            <span class="value">${e.actual_today_kwh.toFixed(2)} kWh / ${e.baseline_elapsed_kwh.toFixed(2)} kWh</span>
          </div>
        `:null}
        ${null!==e.baseline_today_kwh?U`
          <div class="stats-row">
            <span class="label">Baseline today (full day)</span>
            <span class="value">${e.baseline_today_kwh.toFixed(2)} kWh</span>
          </div>
        `:null}
        ${null!=n?U`
          <div class="stats-row">
            <span class="label">Solcast confidence (avg)</span>
            <span class="value">${(100*n).toFixed(0)}%</span>
          </div>
        `:null}
      </div>
    `}_renderArbitrage(t,e,i){return U`
      <div class="stats-block">
        <h3>Arbitrage</h3>
        <div class="profit-value">
          ${void 0!==(null==t?void 0:t.estimated_profit)?`+${t.estimated_profit.toFixed(2)} ${this.currency}`:"--"}
        </div>
        ${void 0!==(null==t?void 0:t.cycle_cost)?U`
          <div class="stats-row">
            <span class="label">Cycle cost</span>
            <span class="value">${t.cycle_cost.toFixed(4)} ${this.currency}/kWh</span>
          </div>
        `:X}
        ${i.length>0?U`
          <div class="stats-row"><span class="label">Sell hours</span></div>
          <div class="hours-list">
            ${i.map(t=>U`
              <span class="hour-chip discharge">${t.hour} ${Ht(t.price,this.priceDecimals,this.currency)}</span>
            `)}
          </div>
        `:X}
        ${e.length>0?U`
          <div class="stats-row" style="margin-top: 8px"><span class="label">Buy hours</span></div>
          <div class="hours-list">
            ${e.map(t=>U`
              <span class="hour-chip charge">${t.hour} ${Ht(t.price,this.priceDecimals,this.currency)}</span>
            `)}
          </div>
        `:X}
      </div>
    `}_renderConsumption(t){return U`
      <div class="stats-block">
        <div class="consumption-header">
          <h3 style="margin:0">Consumption Profile</h3>
          <select @change=${this._handleWeekdayChange}>
            ${Array.from({length:7},(t,e)=>{return U`
              <option value=${e} ?selected=${e===this._selectedWeekday}>${i=e,Wt[i]??""}</option>
            `;var i})}
          </select>
        </div>
        ${(null==t?void 0:t.has_profile)?U`
          <div class="consumption-chart">
            <canvas id="consumptionChart"></canvas>
          </div>
          <div class="consumption-source">Source: History (60d)</div>
        `:U`
          <div class="consumption-source">
            Fallback: ${(null==t?void 0:t.fallback_avg)??"?"} kWh/h (no history sensor configured)
          </div>
        `}
      </div>
    `}_renderLastOptimization(t){return t?U`
      <div class="stats-block">
        <h3>Last Optimization</h3>
        <div class="optimization-meta">
          <div class="meta-item">
            <span class="meta-label">When</span>
            <span class="meta-value">${function(t){if(!t)return"Never";const e=new Date(t).getTime(),i=Date.now(),s=Math.floor((i-e)/6e4);if(s<1)return"Just now";if(s<60)return`${s} min ago`;const o=Math.floor(s/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}(t.timestamp)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Charge</span>
            <span class="meta-value">${t.charge_hours}h</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Discharge</span>
            <span class="meta-value">${t.discharge_hours}h</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Self-consume</span>
            <span class="meta-value">${t.self_consume_hours}h</span>
          </div>
        </div>
        ${t.warnings.length>0?U`${t.warnings.map(t=>U`<div class="warning-item">${t}</div>`)}`:X}
      </div>
    `:U`
        <div class="stats-block">
          <h3>Last Optimization</h3>
          <div class="consumption-source">No optimization has been run yet</div>
        </div>
      `}};ih.styles=yt,eh([gt({attribute:!1})],ih.prototype,"hass",2),eh([gt({attribute:!1})],ih.prototype,"data",2),eh([gt({attribute:!1})],ih.prototype,"integrationConfig",2),eh([gt({type:Number})],ih.prototype,"priceDecimals",2),eh([gt({type:String})],ih.prototype,"currency",2),eh([ft()],ih.prototype,"_consumptionProfile",2),eh([ft()],ih.prototype,"_selectedWeekday",2),eh([ft()],ih.prototype,"_profileLoading",2),ih=eh([dt("es-stats-tab")],ih);var sh=Object.defineProperty,oh=Object.getOwnPropertyDescriptor,nh=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?oh(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&sh(e,i,n),n};t.EnergySchedulerCard=class extends ht{constructor(){super(...arguments),this._loading=!1,this._dataLoaded=!1,this._activeTab="schedule",this._initAttempts=0,this._maxInitAttempts=20,this._versionChecked=!1,this._reloadWithCacheClear=async()=>{try{if("caches"in window){const t=await caches.keys();await Promise.all(t.map(t=>caches.delete(t)))}}catch(t){console.warn("[energy-scheduler-card] cache clear failed",t)}window.location.reload()},this._subscribing=!1,this._handleRefreshEvent=()=>{this._refreshData()},this._handleStatePatch=t=>{const e=t.detail;e.integrationConfig&&(this._integrationConfig={...this._integrationConfig??{},...e.integrationConfig}),e.data&&(this._data={...this._data??{},...e.data})}}connectedCallback(){super.connectedCallback(),this.addEventListener("data-refresh-needed",this._handleRefreshEvent),this.addEventListener("card-state-patch",this._handleStatePatch),this.hass&&this._config&&!this._dataLoaded&&!this._loading&&this._tryInitialize(),this._dataLoaded&&!this._refreshInterval&&this._startAutoRefresh(),this._checkVersion()}async _checkVersion(){if(!this._versionChecked&&this.hass){this._versionChecked=!0;try{const t=await this.hass.connection.sendMessagePromise({type:"hacs_energy_scheduler/version"}),e=null==t?void 0:t.version;e&&e!==qt&&this._showVersionMismatch(e)}catch(t){console.debug("[energy-scheduler-card] version check skipped",t)}}}_showVersionMismatch(t){console.warn(`[energy-scheduler-card] Version mismatch — card: ${qt}, integration: ${t}. Reload to apply updates.`),this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:`Energy Scheduler card is out of date (card ${qt}, integration ${t}). Reload to apply the new version.`,duration:0,dismissable:!0,action:{text:"Reload",action:()=>this._reloadWithCacheClear()}},bubbles:!0,composed:!0}))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("data-refresh-needed",this._handleRefreshEvent),this.removeEventListener("card-state-patch",this._handleStatePatch),this._stopAutoRefresh(),this._unsubscribeEvents(),this._initRetryTimer&&(clearTimeout(this._initRetryTimer),this._initRetryTimer=void 0)}setConfig(t){this._config={title:"Energy Scheduler",show_chart:!0,show_status_bar:!0,show_ev_tab:"auto",chart_height:250,default_tab:"schedule",price_decimals:2,...t},this._activeTab=this._config.default_tab??"schedule",!this.hass||this._dataLoaded||this._loading||this._tryInitialize()}static getConfigElement(){return document.createElement("energy-scheduler-card-editor")}static getStubConfig(){return{type:"custom:energy-scheduler-card",title:"Energy Scheduler",show_chart:!0,show_status_bar:!0,chart_height:250,default_tab:"schedule"}}getCardSize(){return 8}updated(t){if(super.updated(t),t.has("hass")){!t.get("hass")&&this.hass&&this._config&&!this._dataLoaded&&!this._loading&&this._tryInitialize()}}_isHassReady(){return!!this.hass&&"function"==typeof this.hass.callApi&&!1!==this.hass.connected}_tryInitialize(){if(!this._loading&&!this._dataLoaded){if(this._initRetryTimer&&(clearTimeout(this._initRetryTimer),this._initRetryTimer=void 0),!this._isHassReady()&&(this._initAttempts++,this._initAttempts<this._maxInitAttempts)){const t=Math.min(100*Math.pow(1.5,this._initAttempts),2e3);return void(this._initRetryTimer=setTimeout(()=>{this._initRetryTimer=void 0,this._tryInitialize()},t))}this._initAttempts=0,this._initialize()}}async _initialize(){if(!this._loading&&!this._dataLoaded){this._loading=!0,this._error=void 0;try{await this._loadData(),this._dataLoaded=!0,this._startAutoRefresh(),this._subscribeEvents()}catch(t){this._error=t instanceof Error?t.message:"Failed to load data",setTimeout(()=>{this._loading=!1,this._initAttempts=0,this.hass&&this._config&&this._tryInitialize()},5e3)}finally{this._loading=!1}}}async _loadData(){if(!this.hass)throw new Error("Home Assistant not available");const[t,e]=await Promise.all([Yt(this.hass),Xt(this.hass)]);this._integrationConfig=t,this._data=e}_startAutoRefresh(){this._refreshInterval||(this._refreshInterval=setInterval(()=>this._refreshData(),6e4))}_stopAutoRefresh(){this._refreshInterval&&(clearInterval(this._refreshInterval),this._refreshInterval=void 0)}_subscribeEvents(){var t;this._unsubEvents||this._subscribing||!(null==(t=this.hass)?void 0:t.connection)||(this._subscribing=!0,this.hass.connection.subscribeEvents(()=>this._refreshData(),Ut).then(t=>{this._unsubEvents=t,this._stopAutoRefresh()}).catch(()=>{}).finally(()=>{this._subscribing=!1}))}_unsubscribeEvents(){this._unsubEvents&&(this._unsubEvents(),this._unsubEvents=void 0)}async _refreshData(){if(this.hass&&this._dataLoaded)try{const[t,e]=await Promise.all([Yt(this.hass),Xt(this.hass)]);this._integrationConfig=t,this._data=e}catch{}}_onTabChanged(t){this._activeTab=t.detail.tab}_getCurrency(){var t,e;return(null==(t=this._integrationConfig)?void 0:t.currency)??(null==(e=this._config)?void 0:e.currency)??"€"}_shouldShowEvTab(){var t,e;const i=(null==(t=this._config)?void 0:t.show_ev_tab)??"auto";return"always"===i||"never"!==i&&((null==(e=this._integrationConfig)?void 0:e.ev_enabled)??!1)}render(){if(!this._config)return U`<ha-card>No configuration</ha-card>`;const t=this._getCurrency();return U`
      <ha-card>
        ${this._config.title?U`
              <div class="card-header">
                <div class="card-header-icon">
                  <ha-icon icon="mdi:flash"></ha-icon>
                </div>
                <div class="card-header-title">${this._config.title}</div>
              </div>
            `:X}
        <div class="card-content">
          ${!1!==this._config.show_status_bar&&this._dataLoaded?U`
                <es-status-bar
                  .hass=${this.hass}
                  .data=${this._data}
                  .integrationConfig=${this._integrationConfig}
                  .priceDecimals=${this._config.price_decimals??2}
                  .currency=${t}
                ></es-status-bar>
              `:X}

          ${this._dataLoaded?U`
                <es-tab-bar
                  .activeTab=${this._activeTab}
                  .showEvTab=${this._shouldShowEvTab()}
                  @tab-changed=${this._onTabChanged}
                ></es-tab-bar>
              `:X}

          ${this._loading&&!this._dataLoaded?this._renderLoading():X}
          ${this._error?this._renderError():X}
          ${this._dataLoaded?this._renderActiveTab():X}
        </div>
        <div class="notification" id="notification"></div>
      </ha-card>
    `}_renderLoading(){return U`
      <div class="card-loading">
        <div class="card-loading-spinner"></div>
        <span class="card-loading-text">Loading schedule...</span>
      </div>
    `}_renderError(){return U`
      <div class="card-error">
        <div class="card-error-icon">\u26a0\ufe0f</div>
        <div class="card-error-message">${this._error}</div>
        <button class="btn btn-primary" @click=${()=>{this._loading=!1,this._dataLoaded=!1,this._error=void 0,this._initialize()}}>Retry</button>
      </div>
    `}_renderActiveTab(){var t;const e=this._getCurrency();switch(this._activeTab){case"schedule":return U`
          <es-schedule-tab
            .hass=${this.hass}
            .data=${this._data}
            .integrationConfig=${this._integrationConfig}
            .cardConfig=${this._config}
            .currency=${e}
          ></es-schedule-tab>
        `;case"ev":return U`
          <es-ev-tab
            .hass=${this.hass}
            .data=${this._data}
            .integrationConfig=${this._integrationConfig}
          ></es-ev-tab>
        `;case"stats":return U`
          <es-stats-tab
            .hass=${this.hass}
            .data=${this._data}
            .integrationConfig=${this._integrationConfig}
            .priceDecimals=${(null==(t=this._config)?void 0:t.price_decimals)??2}
            .currency=${e}
          ></es-stats-tab>
        `;default:return X}}},t.EnergySchedulerCard.styles=mt,nh([gt({attribute:!1})],t.EnergySchedulerCard.prototype,"hass",2),nh([ft()],t.EnergySchedulerCard.prototype,"_config",2),nh([ft()],t.EnergySchedulerCard.prototype,"_integrationConfig",2),nh([ft()],t.EnergySchedulerCard.prototype,"_data",2),nh([ft()],t.EnergySchedulerCard.prototype,"_loading",2),nh([ft()],t.EnergySchedulerCard.prototype,"_dataLoaded",2),nh([ft()],t.EnergySchedulerCard.prototype,"_error",2),nh([ft()],t.EnergySchedulerCard.prototype,"_activeTab",2),t.EnergySchedulerCard=nh([dt("energy-scheduler-card")],t.EnergySchedulerCard);var ah=Object.defineProperty,rh=Object.getOwnPropertyDescriptor,lh=(t,e,i,s)=>{for(var o,n=s>1?void 0:s?rh(e,i):e,a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&ah(e,i,n),n};t.EnergySchedulerCardEditor=class extends ht{setConfig(t){this._config=t}_fireConfigChanged(){this._config&&this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_updateConfig(t,e){this._config&&(this._config={...this._config,[t]:e},this._fireConfigChanged())}render(){return this._config?U`
      <div class="editor">
        <div class="section-title">Basic</div>

        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title"
            .value=${this._config.title??"Energy Scheduler"}
            @change=${t=>this._updateConfig("title",t.target.value)} />
        </div>

        <div class="form-group">
          <label for="chart_height">Chart Height (px)</label>
          <input type="number" id="chart_height"
            .value=${String(this._config.chart_height??250)}
            min="100" max="500"
            @change=${t=>this._updateConfig("chart_height",parseInt(t.target.value))} />
        </div>

        <div class="form-group">
          <label for="default_tab">Default Tab</label>
          <select id="default_tab"
            .value=${this._config.default_tab??"schedule"}
            @change=${t=>this._updateConfig("default_tab",t.target.value)}>
            <option value="schedule">Schedule</option>
            <option value="control">Control</option>
            <option value="ev">EV</option>
            <option value="stats">Stats</option>
          </select>
        </div>

        <div class="section-title">Visibility</div>

        <div class="form-group">
          <div class="checkbox-row">
            <input type="checkbox" id="show_chart"
              .checked=${!1!==this._config.show_chart}
              @change=${t=>this._updateConfig("show_chart",t.target.checked)} />
            <label for="show_chart">Show Chart</label>
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-row">
            <input type="checkbox" id="show_status_bar"
              .checked=${!1!==this._config.show_status_bar}
              @change=${t=>this._updateConfig("show_status_bar",t.target.checked)} />
            <label for="show_status_bar">Show Status Bar</label>
          </div>
        </div>

        <div class="form-group">
          <label for="show_ev_tab">EV Tab</label>
          <select id="show_ev_tab"
            .value=${this._config.show_ev_tab??"auto"}
            @change=${t=>this._updateConfig("show_ev_tab",t.target.value)}>
            <option value="auto">Auto (show if EV configured)</option>
            <option value="always">Always</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div class="section-title">Display</div>

        <div class="form-group">
          <label for="price_decimals">Price Decimal Places</label>
          <select id="price_decimals"
            .value=${String(this._config.price_decimals??2)}
            @change=${t=>this._updateConfig("price_decimals",parseInt(t.target.value))}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      </div>
    `:U`<div>No configuration</div>`}},t.EnergySchedulerCardEditor.styles=kt,lh([gt({attribute:!1})],t.EnergySchedulerCardEditor.prototype,"hass",2),lh([ft()],t.EnergySchedulerCardEditor.prototype,"_config",2),t.EnergySchedulerCardEditor=lh([dt("energy-scheduler-card-editor")],t.EnergySchedulerCardEditor);const hh="energy-scheduler-card",ch="energy-scheduler-card-editor";function dh(){try{return customElements.get(hh)||customElements.define(hh,t.EnergySchedulerCard),customElements.get(ch)||customElements.define(ch,t.EnergySchedulerCardEditor),!0}catch(e){return!!(e instanceof Error&&e.message.includes("already been defined"))||(console.error("[Energy Scheduler] Registration error:",e),!1)}}window.EnergySchedulerCard=t.EnergySchedulerCard,window.EnergySchedulerCardEditor=t.EnergySchedulerCardEditor,dh(),window.customCards=window.customCards||[],window.customCards.some(t=>t.type===hh)||window.customCards.push({type:hh,name:"Energy Scheduler Card",description:"Manage energy schedule with prices, EV charging, and optimization",preview:!0,documentationURL:"https://github.com/your-repo/hacs-energy-scheduler"}),console.info(`%c ENERGY-SCHEDULER-CARD %c v${qt} %c`,"color: white; background: #4caf50; font-weight: bold; border-radius: 3px 0 0 3px;","color: #4caf50; background: #e8f5e9; font-weight: bold;","background: transparent;");let uh=setInterval(()=>{!customElements.get(hh)&&window.EnergySchedulerCard&&(console.warn("[Energy Scheduler] Registry cleared, re-registering..."),dh())},50);return setTimeout(()=>{uh&&(clearInterval(uh),uh=null)},2e3),Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),t}({});
