using System;

[assembly: WebActivator.PreApplicationStartMethod(
    typeof(Testing_IdentityDatabase_Inital_30_03.App_Start.MySuperPackage), "PreStart")]

namespace Testing_IdentityDatabase_Inital_30_03.App_Start {
    public static class MySuperPackage {
        public static void PreStart() {
            MVCControlsToolkit.Core.Extensions.Register();
            System.Web.Mvc.GlobalFilters.Filters.Add(new MVCControlsToolkit.ActionFilters.PlaceJavascriptAttribute());
        }
    }
}