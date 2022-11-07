export const HiddenSessionId = () => {

  return (
    <input type="hidden" name={"sessionId"} value={sessionStorage.getItem("sessionId") ?? ""}/>
  )
}
