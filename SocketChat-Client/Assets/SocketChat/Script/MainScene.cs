using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class MainScene : MonoBehaviour
{
    [SerializeField]
    InputField nickNameInputField;

    private void Start()
    {
        NetworkManager.it.AddEventCallback(ServerMethod.CONNECT,
            (data) =>
            {
                Debug.Log("Connected");
            });

        NetworkManager.it.AddEventCallback(ServerMethod.OTHER_USER_CONNECT,
            (data) => 
            {
                if (data == string.Empty)
                {
                    Debug.Log("HI");
                }
                else
                {
                    Debug.Log(data);
                }
            });
    }

    public void OnJoin()
    {
        if (string.IsNullOrEmpty(nickNameInputField.text))
        {
            return;
        }

        JSONObject json = new JSONObject();
        json.AddField("name", nickNameInputField.text);
        NetworkManager.it.Emit(ServerMethod.USER_CONNECT, json);
    }
}
