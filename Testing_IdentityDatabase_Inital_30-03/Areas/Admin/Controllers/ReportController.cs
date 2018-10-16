using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Testing_IdentityDatabase_Inital_30_03.Controllers;

namespace Testing_IdentityDatabase_Inital_30_03.Areas.Admin.Controllers
{
    public class ReportController : BaseController
    {
        // GET: Admin/Report
        public ActionResult Index()
        {
            return View();
        }
    }
}