// A response must never replace edits started while it was in flight.
export function createRefreshController({read, apply, canApply, onError}) {
  let pending;
  return function refresh(quiet = false) {
    if (pending) return pending;
    pending = Promise.resolve().then(read).then(snapshot => {
        if (!canApply()) return {applied: false, deferred: true};
        apply(snapshot);
        return {applied: true};
      }).catch(error => {
        onError(error, quiet);
        return {applied: false, error: true};
      }).finally(() => { pending = undefined; });
    return pending;
  };
}
