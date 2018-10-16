using Braintree;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Interface used by Braintree Payments
/// </summary>
namespace Testing_IdentityDatabase_Inital_30_03.Models
{
    public interface IBraintreeConfiguration
    {
        IBraintreeGateway CreateGateway();
        string GetConfigurationSetting(string setting);
        IBraintreeGateway GetGateway();
    }
}