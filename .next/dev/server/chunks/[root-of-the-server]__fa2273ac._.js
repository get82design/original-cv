module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/server/trpc.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "publicProcedure",
    ()=>publicProcedure,
    "router",
    ()=>router
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server__$5b$external$5d$__$2840$trpc$2f$server$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__ = __turbopack_context__.i("[externals]/@trpc/server [external] (@trpc/server, esm_import, [project]/node_modules/@trpc/server)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server__$5b$external$5d$__$2840$trpc$2f$server$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server__$5b$external$5d$__$2840$trpc$2f$server$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const t = __TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server__$5b$external$5d$__$2840$trpc$2f$server$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__["initTRPC"].create();
const router = t.router;
const publicProcedure = t.procedure;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routers/example.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "exampleRouter",
    ()=>exampleRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/trpc.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const exampleRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["router"])({
    hello: __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["publicProcedure"].query(()=>{
        return 'Hello world';
    })
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/api/trpc/[trpc].ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "appRouter",
    ()=>appRouter,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server$2f$adapters$2f$next__$5b$external$5d$__$2840$trpc$2f$server$2f$adapters$2f$next$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__ = __turbopack_context__.i("[externals]/@trpc/server/adapters/next [external] (@trpc/server/adapters/next, esm_import, [project]/node_modules/@trpc/server)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/trpc.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routers$2f$example$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routers/example.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server$2f$adapters$2f$next__$5b$external$5d$__$2840$trpc$2f$server$2f$adapters$2f$next$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routers$2f$example$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server$2f$adapters$2f$next__$5b$external$5d$__$2840$trpc$2f$server$2f$adapters$2f$next$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routers$2f$example$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const appRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["router"])({
    example: __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routers$2f$example$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["exampleRouter"]
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f40$trpc$2f$server$2f$adapters$2f$next__$5b$external$5d$__$2840$trpc$2f$server$2f$adapters$2f$next$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$29$__["createNextApiHandler"]({
    router: appRouter,
    createContext: ()=>({})
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fa2273ac._.js.map