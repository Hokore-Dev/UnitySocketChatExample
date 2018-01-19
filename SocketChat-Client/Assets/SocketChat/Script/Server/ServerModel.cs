using UnityEngine;
using System;

namespace ServerModel
{
    [Serializable]
    public class User
    {
        public string name;

        public JSONObject ToJSON()
        {
            return new JSONObject(JsonUtility.ToJson(this));
        }
    }

    [Serializable]
    public class Message
    {
        public string name;
        public string message;

        public JSONObject ToJSON()
        {
            return new JSONObject(JsonUtility.ToJson(this));
        }
    }
}