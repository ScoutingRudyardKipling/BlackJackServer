"use strict";

class MiddlewareBuilder {


    constructor(routerMethod, scope, funcScope, path) {
        this.routerMethod = routerMethod;
        this.path = path;
        this.args = [];
        this.scope = scope;
        this.funcScope = funcScope;
        this.parameters = {};
    }

    before(func) {
        this.args.push(function(request, response, next) {
            func.apply(this.funcScope, [
                request,
                this.parameters,
                response,
                next
            ]);
        }.bind(this));
        return this;
    }

    setParameters(params) {
        this.parameters = params;
    }

    then(func) {
        this.args.push(function(request, response, next) {
            func.apply(this.funcScope, [
                request,
                this.parameters,
                response,
                next
            ]);
        }.bind(this));
        this.args.unshift(this.path);
        this.routerMethod.apply(this.scope, this.args);

        return this;
    }

}

module.exports = MiddlewareBuilder;