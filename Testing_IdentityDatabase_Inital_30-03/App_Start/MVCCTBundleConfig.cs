using System;
using System.Web.Optimization;

[assembly: WebActivator.PreApplicationStartMethod(
    typeof(Testing_IdentityDatabase_Inital_30_03.App_Start.DMPBundleConfig), "PreStart")]

namespace Testing_IdentityDatabase_Inital_30_03.App_Start {
    public static class DMPBundleConfig {
	public static void PreStart() {
            DMPBundleConfig.RegisterBundles(BundleTable.Bundles);
	    
        }
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862

        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/basics").Include(
                "~/Scripts/jquery-{version}.js")
                .Include("~/Scripts/jquery.validate.min.js")
                .Include("~/Scripts/jquery.validate.unobtrusive.min.js")
                .Include("~/Scripts/globalize/globalize.js"));

            
            var koBundle = new ScriptBundle("~/bundles/ko").Include(
                "~/Scripts/knockout-{version}.js",
                "~/Scripts/knockout.mapping-latest.js");
            koBundle.EnableFileExtensionReplacements = false;//debug version of knockout doesn't work properly
            bundles.Add(koBundle);
            
            bundles.Add(new ScriptBundle("~/bundles/mvcct")
            //    .Include("~/Scripts/jquery-ui-interactions.min.js") /* Add only if you need drag and drop and drop but you don't already include jQuery-ui */
                .Include("~/Scripts/MVCControlToolkit.Controls.Core-{version}.js")
            //    .Include("~/Scripts/MVCControlToolkit.Controls.Items-{version}.js") /* Add only if you use .SortableListFor*/
            //    .Include("~/Scripts/MVCControlToolkit.Controls.Grid-{version}.js")  /* Add only if you use .DataGridFor*/
            //    .Include("~/Scripts/MVCControlToolkit.Controls.Datetime-{version}.js") /* Add only if you use .DateTimeFor*/
                .Include("~/Scripts/MvcControlToolkit.Utils-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/mvcctclient")
                .Include("~/Scripts/MvcControlToolkit.Bindings-{version}.js")
            //    .Include("~/Scripts/MVCControlToolkit.JsQueryable-3.0.0.min.js") /* Add only if you use server/local querying  facilities and/or json server updates*/
                );

            //Select your style framework below:
            /*
            bundles.Add(new StyleBundle("~/Content/css_bootstrap").Include(//Bootstrap css bundle
                 "~/Content/bootstrap.css", //Bootstrap: http://www.nuget.org/packages/Twitter.Bootstrap/
                                            //Add here BootStrap Datepicker CSS(http://www.nuget.org/packages/Bootstrap.Datepicker/)
                                            //It is automatically autodetected and used by all Date/DateTime controls
                 "~/Content/Site.css"));
            bundles.Add(new ScriptBundle("~/bundles/bootstrap_ext").Include(//Bootstrap Js bundle
                "~/Scripts/bootstrap.js", //Bootstrap: http://www.nuget.org/packages/Twitter.Bootstrap/
                "~/Scripts/respond.js"
                                        //Add here BootStrap Datepicker Js(http://www.nuget.org/packages/Bootstrap.Datepicker/)
                                         //It is automatically autodetected and used by all Date/DateTime controls
                ));
            */
            
            /*
             
            bundles.Add(new StyleBundle("~/Content/css_jqueryUI").Include(//jquery ui css bundle
                 "~/Content/themes/base/minified/jquery-ui.min.css",
                 "~/Content/Site.css"));
             
            bundles.Add(new ScriptBundle("~/bundles/jqueryUIGlob").Include(//jQuery UI JS bundle  
                "~/Scripts/jquery-ui-{version}.js",// Jquery UI:http://www.nuget.org/packages/jQuery.UI.Combined/
                "~/Scripts/jquery-ui-i18n.min.js" // Jquery UI Globalization: http://www.nuget.org/packages/jQuery.UI.i18n/
                ));
            */

            /*
            bundles.Add(new StyleBundle("~/Content/css_jmobile").Include(//jquery mobile css bundle
                 "~/Content/jquery.mobile-{version}.css",//jQuery mobile: http://www.nuget.org/packages/jquery.mobile/
                                                         //Add here JQ Mobile Datebox CSS(http://www.nuget.org/packages/jqm-datebox/)
                                                         //It is automatically autodetected and used by all Date/DateTime controls
                 "~/Content/Site.css"));

            bundles.Add(new ScriptBundle("~/bundles/jmobile").Include(//jQuery Mobile Js Bundle
                "~/Scripts/jquery.mobile-{version}.js"   //jQuery mobile: http://www.nuget.org/packages/jquery.mobile/
                                                         //Add here JQ Mobile Datebox CSS(http://www.nuget.org/packages/jqm-datebox/)
                                                         //It is automatically autodetected and used by all Date/DateTime controls
                ));
            */
            
           
            
           
            
        }
    }
}