import {ParameterizedModule} from "../../../module/module";
import {ModuleReference} from "../../../module/moduleID";
import {ChildModule} from "../../../module/_types/moduleContract";
import {ITraceable} from "./ITracable";
import {ITraceableTransformer} from "./ITracableTransformer";

type SerializableBaseData =
    | ParameterizedModule
    | ChildModule<{}>
    | ModuleReference
    | ITraceable
    | string
    | boolean
    | number;

/**
 * Data that can be serialized to json
 */
export type SerializeableData =
    | SerializableBaseData
    | {
          [key: string]: SerializeableData;
      }
    | {
          length: number;
          [key: number]: SerializeableData;
      };

/**
 * Data that can be serialized to json, when including a promise callback
 */
export type AsyncSerializeableData =
    | SerializableBaseData
    | {
          [key: string]: AsyncSerializeableData | Promise<AsyncSerializeableData>;
      }
    | {
          length: number;
          [key: number]: AsyncSerializeableData | Promise<AsyncSerializeableData>;
      };

/**
 * Data that can be serialized to json, when including a promise callback
 */
export type LossyAsyncSerializeableData =
    | SerializableBaseData
    | ITraceableTransformer<any>
    | {
          [key: string]:
              | LossyAsyncSerializeableData
              | Promise<LossyAsyncSerializeableData>;
      }
    | {
          length: number;
          [key: number]:
              | LossyAsyncSerializeableData
              | Promise<LossyAsyncSerializeableData>;
      };
