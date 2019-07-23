import {ParameterizedModule} from "../../module/module";
import {PublicModuleMethods} from "../../module/_types/publicModuleMethods";
import {ModuleReference} from "../../module/moduleID";

/**
 * Data that can be serialized to json
 */
export type SerializeableData =
    | ParameterizedModule
    | PublicModuleMethods
    | ModuleReference
    | string
    | boolean
    | number
    | {
          [key: string]: SerializeableData;
      }
    | {
          [key: number]: SerializeableData;
      };