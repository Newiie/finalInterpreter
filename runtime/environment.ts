import { RuntimeVal } from "./values.ts";

export default class Environment {
  private parent?: Environment;
  public variables: Map<string, RuntimeVal>;

  constructor(parentENV?: Environment) {
    this.parent = parentENV;
    this.variables = new Map();
  }

  public declareVar(varname: string, value: RuntimeVal): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }

    this.variables.set(varname, value);
    return value;
  }

  public checkVar(varname: string): boolean {
    if (varname == undefined) {
      console.log("UNDEFINED")
      return false;
    }
    
    if (this.variables.has(varname)) return true
    return false;
  }
  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (this.parent == undefined) {
      throw `Variable: '${varname}' does not exist.`;
    }

    return this.parent.resolve(varname);
  }
}