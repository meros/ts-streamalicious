import ArrayCollector from "./ArrayCollector";
import CountCollector from "./CountCollector";
import JoiningCollector from "./JoiningCollector";

export function toCount<T>() {
  return new CountCollector<T>();
}

export function toArray<T>() {
  return new ArrayCollector<T>();
}

export function toJointString(seperator: string) {
  return new JoiningCollector(seperator);
}
