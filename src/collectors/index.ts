import ArrayCollector from "./ArrayCollector";
import CountCollector from "./CountCollector";
import FirstCollector from "./FirstCollector";
import JoiningCollector from "./JoiningCollector";

export function toCount<T>() {
  return new CountCollector<T>();
}

export function toArray<T>() {
  return new ArrayCollector<T>();
}

export function toFirst<T>() {
  return new FirstCollector<T>();
}

export function toJointString(seperator: string) {
  return new JoiningCollector(seperator);
}
